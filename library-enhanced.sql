-- Library Management Enhanced Schema
-- Extends library_books + library_issues with 6 new tables

ALTER TABLE library_books ADD COLUMN IF NOT EXISTS edition TEXT;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English';
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS digital_copy TEXT;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS pages INT;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS rack_number TEXT;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS is_reference BOOLEAN DEFAULT false;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS reserved_count INT DEFAULT 0;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS lost_count INT DEFAULT 0;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS damaged_count INT DEFAULT 0;
ALTER TABLE library_books ADD COLUMN IF NOT EXISTS last_inventory_date TIMESTAMPTZ;

ALTER TABLE library_issues ADD COLUMN IF NOT EXISTS issued_to_type TEXT CHECK (issued_to_type IN ('student','teacher','staff'));
ALTER TABLE library_issues ADD COLUMN IF NOT EXISTS issued_to_id UUID;
ALTER TABLE library_issues ADD COLUMN IF NOT EXISTS fine_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE library_issues ADD COLUMN IF NOT EXISTS fine_paid BOOLEAN DEFAULT false;
ALTER TABLE library_issues ADD COLUMN IF NOT EXISTS fine_paid_date TIMESTAMPTZ;
ALTER TABLE library_issues ADD COLUMN IF NOT EXISTS renewed_count INT DEFAULT 0;
ALTER TABLE library_issues ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE library_issues ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;
ALTER TABLE library_issues ADD COLUMN IF NOT EXISTS reminder_sent_date TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS library_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID,
  member_type TEXT CHECK (member_type IN ('student','teacher','staff')),
  membership_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo TEXT,
  max_books_allowed INT DEFAULT 5,
  fine_due DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','expired')),
  joined_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES library_issues(id) ON DELETE CASCADE,
  member_id UUID REFERENCES library_members(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','waived')),
  paid_date TIMESTAMPTZ,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
  member_id UUID REFERENCES library_members(id) ON DELETE CASCADE,
  reservation_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','fulfilled','cancelled','expired')),
  fulfilled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
  inventory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_count INT NOT NULL,
  actual_count INT NOT NULL,
  damaged_count INT DEFAULT 0,
  lost_count INT DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','verified','discrepancy')),
  verified_by UUID,
  verified_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  member_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_library_members_org ON library_members(organisation_id);
CREATE INDEX IF NOT EXISTS idx_library_members_type ON library_members(member_type);
CREATE INDEX IF NOT EXISTS idx_library_fines_issue ON library_fines(issue_id);
CREATE INDEX IF NOT EXISTS idx_library_fines_member ON library_fines(member_id);
CREATE INDEX IF NOT EXISTS idx_library_fines_status ON library_fines(status);
CREATE INDEX IF NOT EXISTS idx_library_reservations_book ON library_reservations(book_id);
CREATE INDEX IF NOT EXISTS idx_library_reservations_member ON library_reservations(member_id);
CREATE INDEX IF NOT EXISTS idx_library_inventory_book ON library_inventory(book_id);
CREATE INDEX IF NOT EXISTS idx_library_activity_org ON library_activity_log(organisation_id);
CREATE INDEX IF NOT EXISTS idx_library_activity_action ON library_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_library_ai_insights_type ON library_ai_insights(insight_type);

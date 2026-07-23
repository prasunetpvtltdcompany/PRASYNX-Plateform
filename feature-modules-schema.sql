-- Feature module tables for Prasunet ERP

-- HEALTH
CREATE TABLE IF NOT EXISTS health_checkups (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID REFERENCES students(id), checkup_date DATE, doctor TEXT, findings TEXT, recommendations TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS health_medications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID REFERENCES students(id), medication_name TEXT, dosage TEXT, frequency TEXT, prescribed_by TEXT, start_date DATE, end_date DATE, created_at TIMESTAMPTZ DEFAULT now());

-- INVENTORY
CREATE TABLE IF NOT EXISTS inventory_assets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), name TEXT, category TEXT, quantity INTEGER DEFAULT 0, condition TEXT, location TEXT, status TEXT DEFAULT 'available', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS inventory_stock (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), item_name TEXT, quantity INTEGER DEFAULT 0, unit TEXT, reorder_level INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS inventory_purchase_orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), supplier TEXT, item TEXT, quantity INTEGER, amount DECIMAL(10,2), order_date DATE, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS inventory_maintenance (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), asset_id UUID, description TEXT, maintenance_date DATE, cost DECIMAL(10,2), performed_by TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- ALUMNI
CREATE TABLE IF NOT EXISTS alumni (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), full_name TEXT, email TEXT, phone TEXT, graduation_year INTEGER, current_occupation TEXT, company TEXT, address TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS alumni_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), title TEXT, description TEXT, event_date DATE, location TEXT, status TEXT DEFAULT 'upcoming', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS alumni_donations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), alumni_id UUID, amount DECIMAL(10,2), purpose TEXT, donation_date DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS alumni_mentors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), alumni_id UUID, expertise TEXT, availability TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- EXTRACURRICULAR
CREATE TABLE IF NOT EXISTS sports_teams (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), name TEXT, sport_type TEXT, coach TEXT, max_players INTEGER, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS extracurricular_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), name TEXT, event_type TEXT, start_date DATE, end_date DATE, location TEXT, coordinator TEXT, status TEXT DEFAULT 'upcoming', created_at TIMESTAMPTZ DEFAULT now());

-- CAREER
CREATE TABLE IF NOT EXISTS career_psychometric_tests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), name TEXT, description TEXT, duration INTEGER, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS career_internships (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), company TEXT, role TEXT, description TEXT, duration TEXT, stipend TEXT, application_deadline DATE, status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS career_college_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), student_id UUID REFERENCES students(id), college_name TEXT, program TEXT, application_date DATE, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS career_skill_assessments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), student_id UUID REFERENCES students(id), skill TEXT, score INTEGER, assessed_date DATE, created_at TIMESTAMPTZ DEFAULT now());

-- STORE
CREATE TABLE IF NOT EXISTS store_products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), name TEXT, description TEXT, price DECIMAL(10,2), stock INTEGER DEFAULT 0, category TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS store_orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), product_id UUID, quantity INTEGER, buyer_name TEXT, buyer_email TEXT, total_amount DECIMAL(10,2), status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS store_menu (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), item_name TEXT, description TEXT, price DECIMAL(10,2), category TEXT, available BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS store_fundraising (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), title TEXT, description TEXT, goal_amount DECIMAL(10,2), raised_amount DECIMAL(10,2) DEFAULT 0, start_date DATE, end_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- COLLABORATION
CREATE TABLE IF NOT EXISTS collaboration_classrooms (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), name TEXT, description TEXT, created_by UUID, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS collaboration_projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), title TEXT, description TEXT, lead_id UUID, due_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- ADMISSION
CREATE TABLE IF NOT EXISTS admission_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), applicant_name TEXT, applicant_email TEXT, phone TEXT, applying_class TEXT, parent_name TEXT, parent_phone TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS admission_enquiries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), name TEXT, email TEXT, phone TEXT, message TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- STAFF MANAGEMENT
CREATE TABLE IF NOT EXISTS staff_job_postings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), title TEXT, department TEXT, description TEXT, requirements TEXT, salary_range TEXT, status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS staff_performance_reviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), staff_id UUID, reviewer_id UUID, rating INTEGER, comments TEXT, review_date DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS staff_training (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), title TEXT, description TEXT, trainer TEXT, start_date DATE, end_date DATE, status TEXT DEFAULT 'scheduled', created_at TIMESTAMPTZ DEFAULT now());

-- DIGITAL CREDENTIALS
CREATE TABLE IF NOT EXISTS digital_certificates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), student_id UUID, certificate_type TEXT, title TEXT, issued_date DATE, expiry_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS digital_credentials (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), user_id UUID, credential_type TEXT, title TEXT, issued_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS digital_badges (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), student_id UUID, badge_name TEXT, badge_type TEXT, awarded_date DATE, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());

-- CREDENTIAL HISTORY
CREATE TABLE IF NOT EXISTS credential_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id UUID REFERENCES organisations(id), user_id UUID, action TEXT, details TEXT, created_at TIMESTAMPTZ DEFAULT now());

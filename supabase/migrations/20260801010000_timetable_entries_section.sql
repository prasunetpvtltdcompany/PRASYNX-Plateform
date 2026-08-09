-- Add section_id to timetable_entries for section-wise timetables
ALTER TABLE timetable_entries
  ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES sections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_timetable_entries_section
  ON timetable_entries(section_id);

-- Add break support
ALTER TABLE timetable_entries
  ADD COLUMN IF NOT EXISTS entry_type text DEFAULT 'regular';
ALTER TABLE timetable_entries
  ADD COLUMN IF NOT EXISTS title text;

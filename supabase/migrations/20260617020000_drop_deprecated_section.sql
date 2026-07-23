-- Drop deprecated students.section (TEXT) column
-- The canonical column is students.section_id (UUID FK → sections.id)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'section'
  ) THEN
    ALTER TABLE students DROP COLUMN section;
    RAISE NOTICE 'Dropped students.section (deprecated TEXT column)';
  END IF;
END $$;

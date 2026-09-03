-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    TEXT UNIQUE NOT NULL,
  staff_name  TEXT NOT NULL,
  department  TEXT,
  email       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Whereabouts table
CREATE TABLE IF NOT EXISTS whereabouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      TEXT NOT NULL REFERENCES staff(staff_id) ON UPDATE CASCADE ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  location      TEXT NOT NULL,
  description   TEXT,
  is_all_day    BOOLEAN DEFAULT FALSE,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  start_time    TIME,
  end_time      TIME,
  notes         TEXT,
  logged_by     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_activity_type CHECK (activity_type IN (
    'offsite_training','certification','vendor_meeting','customer_meeting','vendor_event'
  )),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS whereabouts_updated_at ON whereabouts;
CREATE TRIGGER whereabouts_updated_at
  BEFORE UPDATE ON whereabouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (open policies for this app — restrict as needed)
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE whereabouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_open" ON staff;
CREATE POLICY "staff_open" ON staff FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "whereabouts_open" ON whereabouts;
CREATE POLICY "whereabouts_open" ON whereabouts FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Sample staff data
INSERT INTO staff (staff_id, staff_name, department, email) VALUES
  ('EMP-0001', 'Aarav Shah',    'Engineering', 'aarav.shah@company.com'),
  ('EMP-0002', 'Priya Nair',    'Sales',        'priya.nair@company.com'),
  ('EMP-0003', 'James Tan',     'Operations',   'james.tan@company.com'),
  ('EMP-0004', 'Sofia Chen',    'Marketing',    'sofia.chen@company.com'),
  ('EMP-0005', 'Rohan Kumar',   'Engineering',  'rohan.kumar@company.com'),
  ('EMP-0006', 'Aisha Ibrahim', 'HR',           'aisha.ibrahim@company.com'),
  ('EMP-0007', 'Liam O''Brien', 'Finance',      'liam.obrien@company.com')
ON CONFLICT (staff_id) DO NOTHING;

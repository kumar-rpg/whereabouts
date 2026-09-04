-- Add role field to staff table
ALTER TABLE staff
  ADD COLUMN role TEXT CHECK (role IN ('Admin', 'User')) DEFAULT 'User';

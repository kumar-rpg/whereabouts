-- Add 6-digit system login PIN to staff table
ALTER TABLE staff
  ADD COLUMN access_id TEXT CHECK (access_id ~ '^\d{6}$');

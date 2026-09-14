-- Add customer_support and other to the valid_activity_type check constraint
ALTER TABLE whereabouts
  DROP CONSTRAINT valid_activity_type;

ALTER TABLE whereabouts
  ADD CONSTRAINT valid_activity_type CHECK (activity_type IN (
    'offsite_training','certification','vendor_meeting','customer_meeting','vendor_event',
    'customer_support','other'
  ));

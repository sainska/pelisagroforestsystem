-- Add location column to marketplace_listings table
ALTER TABLE marketplace_listings
ADD COLUMN location text NOT NULL DEFAULT '';

-- Update the view to include the new column
DROP VIEW IF EXISTS marketplace_listings_with_profiles;
CREATE OR REPLACE VIEW marketplace_listings_with_profiles AS
SELECT 
    ml.*,
    p.name as vendor_name,
    p.avatar_url as vendor_avatar
FROM marketplace_listings ml
LEFT JOIN profiles p ON ml.vendor_id = p.id; 
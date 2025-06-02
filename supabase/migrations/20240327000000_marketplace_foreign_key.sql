-- Add foreign key constraint to marketplace_listings table
ALTER TABLE marketplace_listings
ADD CONSTRAINT marketplace_listings_vendor_id_fkey
FOREIGN KEY (vendor_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create a view to join marketplace_listings with profiles
CREATE OR REPLACE VIEW marketplace_listings_with_profiles AS
SELECT 
    ml.*,
    p.name as vendor_name,
    p.avatar_url as vendor_avatar
FROM marketplace_listings ml
LEFT JOIN profiles p ON ml.vendor_id = p.id; 
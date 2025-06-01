-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    price decimal(10,2) NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    category text NOT NULL,
    image_url text,
    vendor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'available',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for marketplace_listings
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view listings
CREATE POLICY "Anyone can view marketplace listings" ON marketplace_listings
    FOR SELECT USING (true);

-- Allow authenticated users to create listings
CREATE POLICY "Authenticated users can create listings" ON marketplace_listings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update their own listings
CREATE POLICY "Users can update own listings" ON marketplace_listings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = vendor_id)
    WITH CHECK (auth.uid() = vendor_id);

-- Allow users to delete their own listings
CREATE POLICY "Users can delete own listings" ON marketplace_listings
    FOR DELETE
    TO authenticated
    USING (auth.uid() = vendor_id);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');

-- Create storage policy to allow anyone to view product images
CREATE POLICY "Anyone can view product images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
    BEFORE UPDATE ON marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
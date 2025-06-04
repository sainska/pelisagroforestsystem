-- Create roles enum type
CREATE TYPE user_role AS ENUM ('NNECFA Admin', 'NNECFA Official', 'Community Member');

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name user_role NOT NULL UNIQUE,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS to roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read roles
CREATE POLICY "Anyone can view roles" ON roles
    FOR SELECT USING (true);

-- Only admins can modify roles
CREATE POLICY "Only admins can modify roles" ON roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'NNECFA Admin'
        )
    );

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('NNECFA Admin', 'System administrator with full access to all features'),
    ('NNECFA Official', 'NNECFA officer with elevated permissions'),
    ('Community Member', 'Regular community member')
ON CONFLICT (name) DO NOTHING;

-- Modify profiles table to use role_id
ALTER TABLE profiles
    DROP COLUMN IF EXISTS role,
    ADD COLUMN role_id uuid REFERENCES roles(id);

-- Create index for role lookups
CREATE INDEX idx_profiles_role_id ON profiles(role_id);

-- Create function to get role_id by name
CREATE OR REPLACE FUNCTION get_role_id_by_name(role_name user_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    role_id uuid;
BEGIN
    SELECT id INTO role_id FROM roles WHERE name = role_name;
    RETURN role_id;
END;
$$;

-- Update existing profiles with correct role_ids
DO $$
DECLARE
    admin_role_id uuid;
    official_role_id uuid;
    member_role_id uuid;
BEGIN
    SELECT id INTO admin_role_id FROM roles WHERE name = 'NNECFA Admin';
    SELECT id INTO official_role_id FROM roles WHERE name = 'NNECFA Official';
    SELECT id INTO member_role_id FROM roles WHERE name = 'Community Member';

    -- Update existing profiles
    UPDATE profiles SET role_id = 
        CASE 
            WHEN role::text = 'NNECFA Admin' THEN admin_role_id
            WHEN role::text = 'NNECFA Official' THEN official_role_id
            ELSE member_role_id
        END;
END;
$$; 
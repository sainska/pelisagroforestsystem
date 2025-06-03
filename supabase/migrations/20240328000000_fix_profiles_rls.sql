-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow public access to check email existence
CREATE POLICY "Anyone can check email existence"
    ON profiles FOR SELECT
    TO anon
    USING (true);

-- Create a function to check if an email exists in both auth.users and profiles
CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    email_exists boolean;
BEGIN
    -- Check in profiles table
    SELECT EXISTS (
        SELECT 1
        FROM profiles
        WHERE email = check_email
    ) INTO email_exists;

    -- If not found in profiles, check in auth.users
    IF NOT email_exists THEN
        SELECT EXISTS (
            SELECT 1
            FROM auth.users
            WHERE email = check_email
        ) INTO email_exists;
    END IF;

    RETURN email_exists;
END;
$$;

-- Create a function to get user email by national ID
CREATE OR REPLACE FUNCTION public.get_user_email_by_national_id(check_national_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email text;
BEGIN
    -- Get email from profiles table by national ID
    SELECT email
    FROM profiles
    WHERE national_id = check_national_id
    INTO user_email;

    RETURN user_email;
END;
$$; 
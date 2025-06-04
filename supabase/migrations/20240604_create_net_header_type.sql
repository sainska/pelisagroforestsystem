-- Enable pg_net extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the net_header type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'net_header') THEN
        CREATE TYPE net_header AS (
            field text,
            value text
        );
    END IF;
END $$;

-- Create aliases for pg_net functions in public schema
CREATE OR REPLACE FUNCTION public.net_http_get(
    url text,
    headers net_header[] DEFAULT NULL::net_header[]
) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT content::jsonb
    FROM extensions.net_http_get(url, headers);
$$;

CREATE OR REPLACE FUNCTION public.net_http_post(
    url text,
    body jsonb DEFAULT NULL::jsonb,
    headers net_header[] DEFAULT NULL::net_header[]
) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT content::jsonb
    FROM extensions.net_http_post(url, body, headers);
$$; 
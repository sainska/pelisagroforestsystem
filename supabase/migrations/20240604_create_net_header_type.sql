-- Enable pg_net extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the net_header type in the extensions schema if it doesn't exist
DO $$ 
BEGIN
    DROP TYPE IF EXISTS extensions.net_header;
    CREATE TYPE extensions.net_header AS (
        field text,
        value text
    );
END $$;

-- Create aliases for pg_net functions in public schema
CREATE OR REPLACE FUNCTION public.net_http_get(
    url text,
    headers extensions.net_header[] DEFAULT NULL::extensions.net_header[]
) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER
SET search_path = extensions, public
AS $$
    SELECT content::jsonb
    FROM extensions.net_http_get(url, headers);
$$;

CREATE OR REPLACE FUNCTION public.net_http_post(
    url text,
    body jsonb DEFAULT NULL::jsonb,
    headers extensions.net_header[] DEFAULT NULL::extensions.net_header[]
) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER
SET search_path = extensions, public
AS $$
    SELECT content::jsonb
    FROM extensions.net_http_post(url, body, headers);
$$; 
-- Create the net_header type for pg_net extension
DO $$ 
BEGIN
    -- Create the net_header type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'net_header') THEN
        CREATE TYPE net_header AS (
            field text,
            value text
        );
    END IF;
END $$; 
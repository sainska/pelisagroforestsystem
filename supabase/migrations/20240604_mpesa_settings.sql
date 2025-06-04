-- First, create a secure schema for settings if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app_settings;

-- Create a settings table to store M-Pesa configuration
CREATE TABLE IF NOT EXISTS app_settings.mpesa_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to get setting
CREATE OR REPLACE FUNCTION app_settings.get_setting(p_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT value FROM app_settings.mpesa_config WHERE key = p_key);
END;
$$;

-- Function to set setting
CREATE OR REPLACE FUNCTION app_settings.set_setting(p_key TEXT, p_value TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO app_settings.mpesa_config (key, value, updated_at)
    VALUES (p_key, p_value, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = p_value, updated_at = NOW();
END;
$$;

-- Insert or update M-Pesa settings with default values
-- Note: These should be updated with real values through the admin interface
SELECT app_settings.set_setting('mpesa_environment', 'sandbox');
SELECT app_settings.set_setting('mpesa_consumer_key', 'BVlcDKODUYi3a6nJNmR1pIPpcDdJpmUJ83KeSmyazIwDuDf8');
SELECT app_settings.set_setting('mpesa_consumer_secret', 'EI3JSrPAblNHuThRA8ee8i1OSHMoDaYiiyCLFAUBff8gmjqHqFqPu4N78unxxgEb');
SELECT app_settings.set_setting('mpesa_passkey', 'n10w8Xm963kPdQ6TiGw+M9bngzpwuakwvjt9EUil7vMck0JSxv4tV175rnfdc8fRrkOglpCO8IjNM1LuWd+uHsvsSoq+sgvka9aOTphf/231UwKv191VH8jDst1vGFq3jX/w2xbmpc0mBM95LA08KV5BKBjXiedSJxMWxeq+YZkXrfEdJYSkCviG2u18zLryrsa4aASmCTEpjDBtFkAGLCYeOGcPp5ejFyPb+pTZctxfkdSAD/3WBbBTCyqNpHVUjWXn3E1wfMYAEhF6DcLS4+7N2OflMd8MFGNBxTsYctreNeauK/ERAMYCTUf1VWl57XxifudttaVO7H34+5IRYA==');
SELECT app_settings.set_setting('mpesa_shortcode', 'your_shortcode');
SELECT app_settings.set_setting('mpesa_callback_url', 'your_callback_url');

-- Create a function to get M-Pesa access token
CREATE OR REPLACE FUNCTION get_mpesa_access_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_response json;
    v_auth text;
    v_consumer_key text;
    v_consumer_secret text;
    v_environment text;
BEGIN
    -- Get credentials from settings table
    SELECT app_settings.get_setting('mpesa_consumer_key') INTO v_consumer_key;
    SELECT app_settings.get_setting('mpesa_consumer_secret') INTO v_consumer_secret;
    SELECT app_settings.get_setting('mpesa_environment') INTO v_environment;

    IF v_consumer_key IS NULL OR v_consumer_secret IS NULL THEN
        RAISE EXCEPTION 'M-Pesa credentials not configured';
    END IF;

    -- Create auth string
    v_auth := encode(
        convert_to(
            v_consumer_key || ':' || v_consumer_secret,
            'utf8'
        ),
        'base64'
    );

    SELECT content::json INTO v_response
    FROM net_http_get(
        CASE WHEN v_environment = 'production' THEN
            'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        ELSE
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        END,
        ARRAY[
            ('Authorization', 'Basic ' || v_auth)::net_header
        ]
    );

    RETURN v_response->>'access_token';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to get access token: %', SQLERRM;
END;
$$;

-- Function to generate M-Pesa password
CREATE OR REPLACE FUNCTION generate_mpesa_password(p_timestamp text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_shortcode text;
    v_passkey text;
BEGIN
    -- Get credentials from settings table
    SELECT app_settings.get_setting('mpesa_shortcode') INTO v_shortcode;
    SELECT app_settings.get_setting('mpesa_passkey') INTO v_passkey;

    IF v_shortcode IS NULL OR v_passkey IS NULL THEN
        RAISE EXCEPTION 'M-Pesa shortcode or passkey not configured';
    END IF;

    RETURN encode(
        convert_to(
            v_shortcode || v_passkey || p_timestamp,
            'utf8'
        ),
        'base64'
    );
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA app_settings TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA app_settings TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_settings TO service_role;

-- Create a view to easily check current settings
CREATE OR REPLACE VIEW app_settings.current_mpesa_settings AS
SELECT 
    key,
    value,
    updated_at
FROM app_settings.mpesa_config
ORDER BY key; 
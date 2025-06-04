-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS public.initiate_mpesa_stk_push(VARCHAR, DECIMAL, VARCHAR);
DROP FUNCTION IF EXISTS public.initiate_mpesa_stk_push(TEXT, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.verify_mpesa_code_exists(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS public.verify_mpesa_code_exists(TEXT, TEXT);

-- Drop existing table to ensure clean state
DROP TABLE IF EXISTS public.stk_push_requests CASCADE;

-- Create the stk_push_requests table
CREATE TABLE public.stk_push_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    account_reference TEXT NOT NULL,
    checkout_request_id TEXT,
    merchant_request_id TEXT,
    mpesa_receipt_number TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stk_push_requests_phone_number ON public.stk_push_requests(phone_number);
CREATE INDEX IF NOT EXISTS idx_stk_push_requests_mpesa_receipt ON public.stk_push_requests(mpesa_receipt_number);

-- Ensure payments table exists
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    mpesa_code TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    stk_request_id UUID REFERENCES public.stk_push_requests(id),
    payment_type TEXT DEFAULT 'manual',
    UNIQUE(mpesa_code)
);

-- Create a function to get M-Pesa access token
CREATE OR REPLACE FUNCTION get_mpesa_access_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    FROM extensions.net_http_get(
        CASE WHEN v_environment = 'production' THEN
            'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        ELSE
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        END,
        ARRAY[
            ('Authorization', 'Basic ' || v_auth)::extensions.net_header
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
SET search_path = public
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

-- Update the STK push function to use actual M-Pesa API
CREATE OR REPLACE FUNCTION public.initiate_mpesa_stk_push(
    p_phone_number TEXT,
    p_amount DECIMAL,
    p_account_reference TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result jsonb;
    v_request_id UUID;
    v_timestamp text;
    v_password text;
    v_token text;
    v_response json;
    v_shortcode text;
    v_callback_url text;
    v_environment text;
BEGIN
    -- Validate phone number format
    IF NOT p_phone_number ~ '^254[0-9]{9}$' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid phone number format. Use format: 254XXXXXXXXX'
        );
    END IF;

    -- Get M-Pesa settings
    SELECT app_settings.get_setting('mpesa_shortcode') INTO v_shortcode;
    SELECT app_settings.get_setting('mpesa_callback_url') INTO v_callback_url;
    SELECT app_settings.get_setting('mpesa_environment') INTO v_environment;

    IF v_shortcode IS NULL OR v_callback_url IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'M-Pesa configuration incomplete. Please configure shortcode and callback URL.'
        );
    END IF;

    -- Generate timestamp (YYYYMMDDHHmmss)
    v_timestamp := to_char(now(), 'YYYYMMDDHH24MISS');
    
    -- Get access token
    v_token := get_mpesa_access_token();
    
    -- Generate password
    v_password := generate_mpesa_password(v_timestamp);

    -- Insert initial record
    INSERT INTO public.stk_push_requests (
        phone_number,
        amount,
        account_reference
    ) VALUES (
        p_phone_number,
        p_amount,
        p_account_reference
    ) RETURNING id INTO v_request_id;

    -- Make API call to M-Pesa
    SELECT content::json INTO v_response
    FROM extensions.net_http_post(
        CASE WHEN v_environment = 'production' THEN
            'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        ELSE
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        END,
        jsonb_build_object(
            'BusinessShortCode', v_shortcode,
            'Password', v_password,
            'Timestamp', v_timestamp,
            'TransactionType', 'CustomerPayBillOnline',
            'Amount', p_amount::text,
            'PartyA', p_phone_number,
            'PartyB', v_shortcode,
            'PhoneNumber', p_phone_number,
            'CallBackURL', v_callback_url,
            'AccountReference', p_account_reference,
            'TransactionDesc', 'NNECFA Registration Payment'
        )::text,
        'application/json',
        ARRAY[
            ('Authorization', 'Bearer ' || v_token)::extensions.net_header
        ]
    );

    -- Update the request with response data
    UPDATE public.stk_push_requests
    SET 
        checkout_request_id = v_response->>'CheckoutRequestID',
        merchant_request_id = v_response->>'MerchantRequestID',
        status = 'processing',
        updated_at = NOW()
    WHERE id = v_request_id;

    RETURN jsonb_build_object(
        'success', true,
        'checkout_request_id', v_response->>'CheckoutRequestID',
        'merchant_request_id', v_response->>'MerchantRequestID',
        'response_code', v_response->>'ResponseCode',
        'response_description', v_response->>'ResponseDescription',
        'customer_message', v_response->>'CustomerMessage'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Update request status to failed
        IF v_request_id IS NOT NULL THEN
            UPDATE public.stk_push_requests
            SET 
                status = 'failed',
                updated_at = NOW()
            WHERE id = v_request_id;
        END IF;

        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to verify M-Pesa payment with consistent TEXT type
CREATE OR REPLACE FUNCTION public.verify_mpesa_code_exists(
    p_mpesa_code TEXT,
    p_phone_number TEXT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- First check in stk_push_requests table
    IF EXISTS (
        SELECT 1 FROM public.stk_push_requests 
        WHERE mpesa_receipt_number = p_mpesa_code 
        AND phone_number = p_phone_number
    ) THEN
        RETURN true;
    END IF;

    -- Then check in payments table
    RETURN EXISTS (
        SELECT 1 FROM public.payments 
        WHERE mpesa_code = p_mpesa_code 
        AND phone_number = p_phone_number
    );
END;
$$; 
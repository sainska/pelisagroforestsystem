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

-- Create the function to initiate STK push with consistent TEXT type
CREATE OR REPLACE FUNCTION public.initiate_mpesa_stk_push(
    p_phone_number TEXT,
    p_amount DECIMAL,
    p_account_reference TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
    v_request_id UUID;
BEGIN
    -- Validate phone number format
    IF NOT p_phone_number ~ '^254[0-9]{9}$' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid phone number format. Use format: 254XXXXXXXXX'
        );
    END IF;

    -- Insert the request into stk_push_requests table
    INSERT INTO public.stk_push_requests (
        phone_number,
        amount,
        account_reference
    ) VALUES (
        p_phone_number,
        p_amount,
        p_account_reference
    ) RETURNING id INTO v_request_id;

    -- For now, return a mock successful response
    -- TODO: Replace with actual M-Pesa API call when credentials are configured
    v_result := jsonb_build_object(
        'success', true,
        'checkout_request_id', v_request_id,
        'merchant_request_id', 'mock_' || v_request_id,
        'message', 'STK push request initiated successfully'
    );

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
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
export const darajaConfig = {
  // Your Daraja API credentials
  consumerKey: process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.NEXT_PUBLIC_MPESA_CONSUMER_SECRET || '',
  passKey: process.env.NEXT_PUBLIC_MPESA_PASSKEY || '',
  shortCode: process.env.NEXT_PUBLIC_MPESA_BUSINESS_SHORT_CODE || '',
  
  // API endpoints
  endpoints: {
    sandbox: {
      auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkQuery: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
    },
    production: {
      auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkQuery: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
    }
  },

  // Callback URLs - Update these with your actual callback URLs
  callbackUrl: process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL || 'https://your-domain.com/api/mpesa/callback',
  timeoutUrl: process.env.NEXT_PUBLIC_MPESA_TIMEOUT_URL || 'https://your-domain.com/api/mpesa/timeout',

  // Environment
  isDevelopment: process.env.NODE_ENV !== 'production'
}; 
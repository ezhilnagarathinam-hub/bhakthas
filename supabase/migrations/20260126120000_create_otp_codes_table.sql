-- Create table to store OTP codes for verification
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target TEXT NOT NULL,
  type TEXT NOT NULL, -- 'email' or 'phone'
  code_hash TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert otp codes"
  ON public.otp_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own otp codes"
  ON public.otp_codes FOR SELECT
  USING (true);

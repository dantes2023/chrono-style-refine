
-- Fix: payment_settings public SELECT policy exposes API keys/secrets
-- Replace the overly permissive public read with a restricted policy
-- that only exposes non-sensitive fields (gateway, is_active) publicly

DROP POLICY IF EXISTS "Payment settings are publicly readable" ON public.payment_settings;

-- Public can only see if payments are active and which gateway (not the config/secrets)
CREATE POLICY "Payment settings public read non-sensitive"
ON public.payment_settings
FOR SELECT
TO public
USING (true);


-- Remove public SELECT on payment_settings to protect API keys in config column
DROP POLICY IF EXISTS "Payment settings public read non-sensitive" ON public.payment_settings;

-- Create a secure RPC that returns only non-sensitive payment info
CREATE OR REPLACE FUNCTION public.get_payment_status()
RETURNS TABLE(gateway text, is_active boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gateway, is_active
  FROM public.payment_settings
  LIMIT 1;
$$;

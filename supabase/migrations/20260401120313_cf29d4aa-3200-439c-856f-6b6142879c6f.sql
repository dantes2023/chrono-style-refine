
-- Fix 1: Remove the dangerous guest order SELECT policy and replace with a safe one
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;

CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
TO public
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

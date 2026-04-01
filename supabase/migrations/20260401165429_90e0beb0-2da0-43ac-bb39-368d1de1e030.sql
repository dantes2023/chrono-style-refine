-- Drop the restrictive SELECT policy and the duplicate one
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Recreate a single SELECT policy that allows:
-- 1. Authenticated users to read their own orders
-- 2. Guest users (unauthenticated) to read guest orders (user_id IS NULL)
-- 3. Admins to read all orders
CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (auth.uid() IS NULL AND user_id IS NULL)
);
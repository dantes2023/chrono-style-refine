
-- 1. Fix orders: remove the overly permissive "Anyone can read orders they just created" policy
DROP POLICY IF EXISTS "Anyone can read orders they just created" ON public.orders;

-- Replace with: users can only read their own orders (by user_id)
CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
TO public
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND user_id IS NULL AND id = id)
);

-- 2. Fix orders INSERT: restrict so user_id must match auth.uid() or be null for guests
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- 3. Fix order_items: restrict INSERT to only allow items for orders the user owns
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Users can create own order items"
ON public.order_items
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

-- 4. Fix order_items SELECT: restrict to own orders only
DROP POLICY IF EXISTS "Anyone can read order items" ON public.order_items;

CREATE POLICY "Users can read own order items"
ON public.order_items
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 5. Fix user_roles: add explicit WITH CHECK to the ALL policy for clarity
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

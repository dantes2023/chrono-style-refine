
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway text NOT NULL DEFAULT 'none',
  is_active boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment settings" ON public.payment_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Payment settings are publicly readable" ON public.payment_settings
  FOR SELECT TO public
  USING (true);

-- Insert default row
INSERT INTO public.payment_settings (gateway, is_active, config)
VALUES ('none', false, '{}');

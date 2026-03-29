
CREATE TABLE public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  detailed_description text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Results are publicly readable"
ON public.results FOR SELECT TO public
USING (is_active = true);

CREATE POLICY "Admins can manage results"
ON public.results FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

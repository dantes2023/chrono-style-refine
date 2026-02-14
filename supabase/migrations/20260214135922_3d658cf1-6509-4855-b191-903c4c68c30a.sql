
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Subcategories are publicly readable" ON public.subcategories FOR SELECT USING (is_active = true);

-- Admin manage policies
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage subcategories" ON public.subcategories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update products table to reference subcategory
ALTER TABLE public.products ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL;

-- Seed initial categories and subcategories
INSERT INTO public.categories (name, display_order) VALUES
  ('Sementes', 1),
  ('Fertilizantes', 2),
  ('Defensivos', 3),
  ('Corretivos de Solo', 4),
  ('Pastagens em geral', 5);

-- Seed subcategories for Sementes
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT c.id, s.name, s.ord
FROM public.categories c
CROSS JOIN (VALUES
  ('Sementes de Arroz', 1),
  ('Sementes de Milho', 2),
  ('Sementes de Soja', 3),
  ('Sementes de Sorgo', 4),
  ('Sementes de Milheto', 5),
  ('Sementes de Cristalaria', 6),
  ('Sementes de Forrageiras', 7),
  ('Sementes de Frutas e Hortaliça', 8),
  ('Sementes de Feijão', 9)
) AS s(name, ord)
WHERE c.name = 'Sementes';

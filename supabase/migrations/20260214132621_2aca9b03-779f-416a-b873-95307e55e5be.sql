
ALTER TABLE public.products
ADD COLUMN detailed_description text,
ADD COLUMN characteristics jsonb,
ADD COLUMN technical_sheet jsonb;

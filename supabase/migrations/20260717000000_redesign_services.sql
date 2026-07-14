-- Phase 1: Add new columns and update types in service_templates
ALTER TABLE public.service_templates ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.service_templates ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE public.service_templates ALTER COLUMN duration_minutes DROP NOT NULL;

-- Drop old pricing check and replace with the new expanded one
ALTER TABLE public.service_templates DROP CONSTRAINT IF EXISTS service_templates_pricing_type_check;
ALTER TABLE public.service_templates ADD CONSTRAINT service_templates_pricing_type_check 
  CHECK (pricing_type = ANY (ARRAY['FREE', 'FIXED', 'HOURLY', 'COMMISSION', 'PERCENTAGE', 'RANGE']));


-- Generate slugs for existing templates (e.g. 'Buyer Consultation' -> 'buyer-consultation')
UPDATE public.service_templates 
SET slug = LOWER(REPLACE(name, ' ', '-'))
WHERE slug IS NULL;

-- Make slug NOT NULL after population
ALTER TABLE public.service_templates ALTER COLUMN slug SET NOT NULL;

-- Update RLS for service_templates
DROP POLICY IF EXISTS "Allow authenticated users to read service templates" ON public.service_templates;
CREATE POLICY "Allow authenticated users to read active service templates"
ON public.service_templates
FOR SELECT
TO authenticated
USING (active = true);

-- Phase 2: Add new columns to services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS template_id UUID NULL REFERENCES public.service_templates(id) ON DELETE RESTRICT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS created_by UUID NULL;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS updated_by UUID NULL;

-- Data Migration: Link existing template rows to their template_id
UPDATE public.services s
SET 
  template_id = t.id,
  is_custom = false
FROM public.service_templates t
WHERE s.name = t.name AND s.is_template = true;

-- For any custom services that existed previously, mark them as custom
UPDATE public.services
SET is_custom = true
WHERE is_template = false OR is_template IS NULL;

-- Drop is_template column
ALTER TABLE public.services DROP COLUMN IF EXISTS is_template;

-- Alter columns that are required in old schema but might be omitted for overrides/custom
ALTER TABLE public.services ALTER COLUMN description DROP NOT NULL;
ALTER TABLE public.services ALTER COLUMN duration_minutes DROP NOT NULL;

-- Clean up obsolete constraints
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_agency_id_name_key;
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS chk_range_price;
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS chk_fixed_price;
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS chk_free_price;
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_pricing_type_check;

-- Add updated pricing check
ALTER TABLE public.services ADD CONSTRAINT services_pricing_type_check 
  CHECK (pricing_type = ANY (ARRAY['FREE', 'FIXED', 'HOURLY', 'COMMISSION', 'PERCENTAGE', 'RANGE']));

-- Phase 3: Add new constraints
-- 1. An agency can only have one override per template
ALTER TABLE public.services ADD CONSTRAINT services_agency_id_template_id_key UNIQUE (agency_id, template_id);

-- 2. An agency can only have one custom service with the same name (ignoring soft-deleted rows)
CREATE UNIQUE INDEX IF NOT EXISTS services_agency_id_name_custom_idx 
ON public.services (agency_id, name) 
WHERE template_id IS NULL AND deleted_at IS NULL;

-- Phase 4: Indexes
CREATE INDEX IF NOT EXISTS idx_services_agency_id ON public.services(agency_id);
CREATE INDEX IF NOT EXISTS idx_services_template_id ON public.services(template_id);
CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON public.services(deleted_at);
CREATE INDEX IF NOT EXISTS idx_service_templates_slug ON public.service_templates(slug);

-- Phase 5: RLS for services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view services from their agency" ON public.services;
DROP POLICY IF EXISTS "Users can insert services for their agency" ON public.services;
DROP POLICY IF EXISTS "Users can update services for their agency" ON public.services;
DROP POLICY IF EXISTS "Users can delete custom services from their agency" ON public.services;

-- Select: Agency users can view non-deleted services
CREATE POLICY "Agency users can view non-deleted services"
ON public.services FOR SELECT TO authenticated
USING (
    deleted_at IS NULL AND
    (
        agency_id IN (
            SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
        )
        OR
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        )
    )
);

-- Insert: Agency users can insert services for their agency
CREATE POLICY "Agency users can insert services for their agency"
ON public.services FOR INSERT TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
    OR
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    )
);

-- Update: Agency users can update their non-deleted services
CREATE POLICY "Agency users can update their non-deleted services"
ON public.services FOR UPDATE TO authenticated
USING (
    deleted_at IS NULL AND
    (
        agency_id IN (
            SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
        )
        OR
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        )
    )
);

-- Delete: Agency users can physically delete overrides only. Custom services should be soft-deleted via UPDATE.
-- For safety, we allow DELETE, but the frontend/backend ServiceManager will govern whether it's a soft delete (UPDATE) or hard delete.
CREATE POLICY "Agency users can physically delete services"
ON public.services FOR DELETE TO authenticated
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
    OR
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    )
);

-- Phase 6: Ensure PostgREST Permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.service_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;


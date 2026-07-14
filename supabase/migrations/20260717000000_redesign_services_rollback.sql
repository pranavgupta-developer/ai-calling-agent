-- Rollback Phase 1: Restore is_template column and populate it
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

UPDATE public.services
SET is_template = true
WHERE template_id IS NOT NULL;

UPDATE public.services
SET is_template = false
WHERE template_id IS NULL;

-- Rollback Phase 2: Recreate duplicated template rows if they were deleted
-- Since we deduplicated, restoring exact state might require re-inserting from service_templates 
-- for agencies that had overrides deleted. For simplicity, we just mark current overrides as templates.

-- Rollback Phase 3: Drop new columns and constraints
DROP INDEX IF EXISTS services_agency_id_name_custom_idx;
DROP INDEX IF EXISTS idx_services_agency_id;
DROP INDEX IF EXISTS idx_services_template_id;
DROP INDEX IF EXISTS idx_services_deleted_at;
DROP INDEX IF EXISTS idx_service_templates_slug;

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_agency_id_template_id_key;

-- Restore constraints and column types
ALTER TABLE public.services ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.services ALTER COLUMN duration_minutes SET NOT NULL;
ALTER TABLE public.service_templates ALTER COLUMN duration_minutes SET NOT NULL;

-- Restore old pricing checks
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_pricing_type_check;
ALTER TABLE public.service_templates DROP CONSTRAINT IF EXISTS service_templates_pricing_type_check;

ALTER TABLE public.services ADD CONSTRAINT services_pricing_type_check CHECK (pricing_type = ANY (ARRAY['FREE', 'FIXED', 'RANGE']));
ALTER TABLE public.service_templates ADD CONSTRAINT service_templates_pricing_type_check CHECK (pricing_type = ANY (ARRAY['free', 'fixed', 'range']));

ALTER TABLE public.services ADD CONSTRAINT chk_range_price check (((pricing_type <> 'range'::text) or ((min_price is not null) and (max_price is not null) and (min_price <= max_price))));
ALTER TABLE public.services ADD CONSTRAINT chk_fixed_price check (((pricing_type <> 'fixed'::text) or (fixed_price is not null)));
ALTER TABLE public.services ADD CONSTRAINT chk_free_price check (((pricing_type <> 'free'::text) or ((fixed_price is null) and (min_price is null) and (max_price is null))));

-- Note: We are ignoring the unique name constraint restoration for simplicity as duplicating name was allowed if they are templates.

ALTER TABLE public.services DROP COLUMN IF EXISTS template_id;
ALTER TABLE public.services DROP COLUMN IF EXISTS is_custom;
ALTER TABLE public.services DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE public.services DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE public.services DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.services DROP COLUMN IF EXISTS updated_by;

ALTER TABLE public.service_templates DROP COLUMN IF EXISTS slug;
ALTER TABLE public.service_templates DROP COLUMN IF EXISTS display_order;

-- Rollback Phase 4: Restore old RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read active service templates" ON public.service_templates;
CREATE POLICY "Allow authenticated users to read service templates"
ON public.service_templates
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Agency users can view non-deleted services" ON public.services;
DROP POLICY IF EXISTS "Agency users can insert services for their agency" ON public.services;
DROP POLICY IF EXISTS "Agency users can update their non-deleted services" ON public.services;
DROP POLICY IF EXISTS "Agency users can physically delete services" ON public.services;

CREATE POLICY "Users can view services from their agency"
ON public.services FOR SELECT TO authenticated
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
    OR
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Users can insert services for their agency"
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

CREATE POLICY "Users can update services for their agency"
ON public.services FOR UPDATE TO authenticated
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
    OR
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Users can delete custom services from their agency"
ON public.services FOR DELETE TO authenticated
USING (
    is_template = false 
    AND (
        agency_id IN (
            SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
        )
        OR
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        )
    )
);

-- Migration: Create Property Images Table and Storage Bucket

-- 1. Create the `property_images` table
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_property_images_updated_at ON public.property_images;
CREATE TRIGGER update_property_images_updated_at
BEFORE UPDATE ON public.property_images
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Policy: Select
DROP POLICY IF EXISTS "Users can view property images of their agency" ON public.property_images;
CREATE POLICY "Users can view property images of their agency"
ON public.property_images FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Insert
DROP POLICY IF EXISTS "Users can insert property images for their agency" ON public.property_images;
CREATE POLICY "Users can insert property images for their agency"
ON public.property_images FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Update
DROP POLICY IF EXISTS "Users can update property images for their agency" ON public.property_images;
CREATE POLICY "Users can update property images for their agency"
ON public.property_images FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Delete
DROP POLICY IF EXISTS "Users can delete property images for their agency" ON public.property_images;
CREATE POLICY "Users can delete property images for their agency"
ON public.property_images FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.property_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.property_images TO service_role;

-- 2. Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', false)
ON CONFLICT (id) DO NOTHING;



-- Storage Policy: Select
DROP POLICY IF EXISTS "Agencies can view their own listing images" ON storage.objects;
CREATE POLICY "Agencies can view their own listing images"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1]::uuid IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Storage Policy: Insert
DROP POLICY IF EXISTS "Agencies can upload their own listing images" ON storage.objects;
CREATE POLICY "Agencies can upload their own listing images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1]::uuid IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Storage Policy: Update
DROP POLICY IF EXISTS "Agencies can update their own listing images" ON storage.objects;
CREATE POLICY "Agencies can update their own listing images"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1]::uuid IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Storage Policy: Delete
DROP POLICY IF EXISTS "Agencies can delete their own listing images" ON storage.objects;
CREATE POLICY "Agencies can delete their own listing images"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1]::uuid IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

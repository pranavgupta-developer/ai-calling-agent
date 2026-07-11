-- Migration: Create Properties Table
-- Creates the `properties` table for listings and sets up RLS policies.

CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_type TEXT NOT NULL,
    listing_type TEXT NOT NULL,
    price NUMERIC NOT NULL,
    price_type TEXT NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 0,
    bathrooms INTEGER NOT NULL DEFAULT 0,
    parking INTEGER NOT NULL DEFAULT 0,
    square_feet NUMERIC NOT NULL,
    year_built INTEGER NOT NULL,
    amenities TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Allow users to view properties from their own agency
CREATE POLICY "Users can view properties of their agency"
ON public.properties FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Allow users to insert properties for their own agency
CREATE POLICY "Users can insert properties for their agency"
ON public.properties FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Allow users to update properties for their own agency
CREATE POLICY "Users can update properties for their agency"
ON public.properties FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Allow users to delete properties for their own agency
CREATE POLICY "Users can delete properties for their agency"
ON public.properties FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Grant privileges to roles
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.properties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.properties TO service_role;
GRANT SELECT ON TABLE public.properties TO anon;

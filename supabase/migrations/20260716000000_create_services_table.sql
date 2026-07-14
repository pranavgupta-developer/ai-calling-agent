-- Create the services table for agency-specific instances of services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    pricing_type TEXT DEFAULT 'FIXED',
    fixed_price NUMERIC,
    min_price NUMERIC,
    max_price NUMERIC,
    currency TEXT DEFAULT 'INR',
    duration_minutes INTEGER,
    active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate service names within the same agency
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_agency_id_name_key;
ALTER TABLE public.services ADD CONSTRAINT services_agency_id_name_key UNIQUE (agency_id, name);

-- Grant permissions (fixes "permission denied for table services")
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT ON public.services TO anon;

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to ensure clean state
DROP POLICY IF EXISTS "Users can view services from their agency" ON public.services;
DROP POLICY IF EXISTS "Users can insert services for their agency" ON public.services;
DROP POLICY IF EXISTS "Users can update services for their agency" ON public.services;
DROP POLICY IF EXISTS "Users can delete custom services from their agency" ON public.services;

-- Policies
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

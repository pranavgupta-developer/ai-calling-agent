-- Migration: Agency Onboarding & Settings
-- Add new columns for business profile and onboarding completion

-- 1. Add new columns to `agencies` table
ALTER TABLE public.agencies
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11,8),
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS is_onboarding_completed BOOLEAN DEFAULT false;

-- 2. Create the Storage Bucket for Agency Assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agency-assets', 'agency-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage RLS Policies
-- Allow public access to read all files in agency-assets
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'agency-assets');

-- Allow authenticated users to insert files if they belong to their agency
-- We determine agency ownership by joining with agency_users
CREATE POLICY "Users can upload agency assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'agency-assets' AND
    (auth.uid() IN (
        SELECT auth_user_id 
        FROM public.agency_users 
        WHERE agency_users.agency_id::text = (string_to_array(name, '/'))[1]
    ))
);

-- Allow authenticated users to update/delete files if they belong to their agency
CREATE POLICY "Users can update agency assets" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'agency-assets' AND
    (auth.uid() IN (
        SELECT auth_user_id 
        FROM public.agency_users 
        WHERE agency_users.agency_id::text = (string_to_array(name, '/'))[1]
    ))
);

CREATE POLICY "Users can delete agency assets" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'agency-assets' AND
    (auth.uid() IN (
        SELECT auth_user_id 
        FROM public.agency_users 
        WHERE agency_users.agency_id::text = (string_to_array(name, '/'))[1]
    ))
);

-- 4. Enable RLS on Agencies and add missing Insert/Update policies
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create a new agency and be the owner
CREATE POLICY "Authenticated users can create agencies"
ON public.agencies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Allow agency owners to update their own agency profile
CREATE POLICY "Owners can update their agencies"
ON public.agencies FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

-- Allow users to read agencies they belong to
CREATE POLICY "Users can view their agencies"
ON public.agencies FOR SELECT
TO authenticated
USING (
    auth.uid() = owner_id OR
    id IN (SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid())
);

-- 5. Enable RLS on Agency Users and add missing policies
ALTER TABLE public.agency_users ENABLE ROW LEVEL SECURITY;

-- Allow the owner to insert into agency_users
CREATE POLICY "Owners can add agency users"
ON public.agency_users FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM public.agencies WHERE id = agency_users.agency_id)
);

-- Also allow a user to view themselves in agency_users
CREATE POLICY "Users can view their own roles"
ON public.agency_users FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid() OR agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

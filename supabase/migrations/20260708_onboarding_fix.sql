-- Fix for infinite recursion in RLS policies

-- 1. Drop all potentially conflicting policies
DROP POLICY IF EXISTS "Authenticated users can create agencies" ON public.agencies;
DROP POLICY IF EXISTS "Owners can update their agencies" ON public.agencies;
DROP POLICY IF EXISTS "Users can view their agencies" ON public.agencies;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.agency_users;
DROP POLICY IF EXISTS "Owners can add agency users" ON public.agency_users;
DROP POLICY IF EXISTS "Users can view users in their agency" ON public.agency_users;

-- 2. Recreate Agencies Policies
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
    EXISTS (
        SELECT 1 FROM public.agency_users 
        WHERE agency_users.agency_id = agencies.id 
        AND agency_users.auth_user_id = auth.uid()
    )
);

-- 3. Recreate Agency Users Policies
-- Allow a user to view their own roles (this breaks the circular dependency!)
CREATE POLICY "Users can view their own roles"
ON public.agency_users FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Allow the owner of an agency to insert into agency_users
CREATE POLICY "Owners can add agency users"
ON public.agency_users FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.agencies 
        WHERE id = agency_users.agency_id 
        AND owner_id = auth.uid()
    )
);

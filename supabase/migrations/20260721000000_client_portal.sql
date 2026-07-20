-- Migration: Client Portal Foundation
-- Creates client_users table and updates RLS policies for client access

-- 1. Create client_users mapping table
DROP TABLE IF EXISTS public.client_users CASCADE;

CREATE TABLE public.client_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT client_users_auth_client_unique UNIQUE (auth_user_id, client_id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_client_users_auth_user_id ON public.client_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON public.client_users(client_id);

-- 3. RLS for client_users
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.client_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.client_users TO service_role;

CREATE POLICY "Users can view their own client mapping"
ON public.client_users FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

CREATE POLICY "Agency users can view client mappings for their agency"
ON public.client_users FOR SELECT
TO authenticated
USING (
    client_id IN (
        SELECT id FROM public.clients WHERE agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
        )
    )
);

-- 4. Update RLS policies for clients table
-- Allow clients to view their own client record
CREATE POLICY "Clients can view their own client record"
ON public.clients FOR SELECT
TO authenticated
USING (
    id IN (SELECT client_id FROM public.client_users WHERE auth_user_id = auth.uid())
    AND deleted_at IS NULL
);

-- Allow clients to update their own client record
CREATE POLICY "Clients can update their own client record"
ON public.clients FOR UPDATE
TO authenticated
USING (
    id IN (SELECT client_id FROM public.client_users WHERE auth_user_id = auth.uid())
    AND deleted_at IS NULL
);

-- 5. Update RLS policies for appointments table
-- Allow clients to view their own appointments
CREATE POLICY "Clients can view their own appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (
    client_id IN (SELECT client_id FROM public.client_users WHERE auth_user_id = auth.uid())
    AND deleted_at IS NULL
);

-- Ensure agencies are visible to authenticated clients? Yes, they should be able to see the agency of their appointments.
-- The public.agencies table might need a policy if not already readable by authenticated users linked via client_users.
-- I will add a policy to let clients view agencies they are associated with.
CREATE POLICY "Clients can view their associated agencies"
ON public.agencies FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT agency_id FROM public.clients 
        WHERE id IN (SELECT client_id FROM public.client_users WHERE auth_user_id = auth.uid())
    )
);

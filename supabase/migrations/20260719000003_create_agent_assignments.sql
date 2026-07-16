-- Migration: Create AI Agent Assignments
-- Creates tables for mapping agents to listings and services.

-- 1. Agent Listings
CREATE TABLE IF NOT EXISTS public.agent_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(agent_id, listing_id)
);

-- Enable RLS
ALTER TABLE public.agent_listings ENABLE ROW LEVEL SECURITY;

-- Policies for agent_listings
CREATE POLICY "Users can view agent_listings of their agency"
ON public.agent_listings FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert agent_listings for their agency"
ON public.agent_listings FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete agent_listings of their agency"
ON public.agent_listings FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- 2. Agent Services
CREATE TABLE IF NOT EXISTS public.agent_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(agent_id, service_id)
);

-- Enable RLS
ALTER TABLE public.agent_services ENABLE ROW LEVEL SECURITY;

-- Policies for agent_services
CREATE POLICY "Users can view agent_services of their agency"
ON public.agent_services FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert agent_services for their agency"
ON public.agent_services FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete agent_services of their agency"
ON public.agent_services FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_listings_agency_id ON public.agent_listings(agency_id);
CREATE INDEX IF NOT EXISTS idx_agent_listings_agent_id ON public.agent_listings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_listings_listing_id ON public.agent_listings(listing_id);

CREATE INDEX IF NOT EXISTS idx_agent_services_agency_id ON public.agent_services(agency_id);
CREATE INDEX IF NOT EXISTS idx_agent_services_agent_id ON public.agent_services(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_services_service_id ON public.agent_services(service_id);

-- Grant privileges
GRANT ALL ON TABLE public.agent_listings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.agent_services TO anon, authenticated, service_role;

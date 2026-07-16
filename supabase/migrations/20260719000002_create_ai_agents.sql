-- Migration: Create AI Agents Table
-- Creates the ai_agents table for configuring AI Agents for an agency.

CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    greeting_message TEXT NOT NULL,
    personality TEXT NOT NULL,
    language TEXT NOT NULL,
    voice TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    temperature NUMERIC DEFAULT 0.3,
    max_tokens INTEGER DEFAULT 1000,
    fallback_to_human BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Future Support fields
    conversation_memory_settings JSONB,
    ai_persona_version INTEGER,
    escalation_rules JSONB,
    working_hours_override JSONB,
    supported_communication_channels TEXT[],
    knowledge_retrieval_configuration JSONB,

    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

-- Policies for ai_agents
CREATE POLICY "Users can view ai_agents of their agency"
ON public.ai_agents FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert ai_agents for their agency"
ON public.ai_agents FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update ai_agents of their agency"
ON public.ai_agents FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete ai_agents of their agency"
ON public.ai_agents FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_agents_updated_at
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_agents_agency_id ON public.ai_agents(agency_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_is_active ON public.ai_agents(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_agents_provider ON public.ai_agents(provider);
CREATE INDEX IF NOT EXISTS idx_ai_agents_language ON public.ai_agents(language);
CREATE INDEX IF NOT EXISTS idx_ai_agents_created_at ON public.ai_agents(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_agents_updated_at ON public.ai_agents(updated_at);

-- Grant privileges
GRANT ALL ON TABLE public.ai_agents TO anon, authenticated, service_role;

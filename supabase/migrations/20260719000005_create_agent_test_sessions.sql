-- Migration: Create Agent Test Sessions and Messages
-- Creates tables to store AI Agent Test Mode sessions and messages.

CREATE TABLE IF NOT EXISTS public.agent_test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'New Test Session',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_test_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.agent_test_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
    content TEXT,
    name TEXT,
    tool_calls JSONB,
    tool_call_id TEXT,
    developer_log JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_test_messages ENABLE ROW LEVEL SECURITY;

-- Policies for agent_test_sessions
CREATE POLICY "Users can view agent_test_sessions of their agency"
ON public.agent_test_sessions FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert agent_test_sessions for their agency"
ON public.agent_test_sessions FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update agent_test_sessions of their agency"
ON public.agent_test_sessions FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete agent_test_sessions of their agency"
ON public.agent_test_sessions FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Policies for agent_test_messages
CREATE POLICY "Users can view agent_test_messages of their agency"
ON public.agent_test_messages FOR SELECT
TO authenticated
USING (
    session_id IN (
        SELECT id FROM public.agent_test_sessions WHERE agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can insert agent_test_messages for their agency"
ON public.agent_test_messages FOR INSERT
TO authenticated
WITH CHECK (
    session_id IN (
        SELECT id FROM public.agent_test_sessions WHERE agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can update agent_test_messages of their agency"
ON public.agent_test_messages FOR UPDATE
TO authenticated
USING (
    session_id IN (
        SELECT id FROM public.agent_test_sessions WHERE agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can delete agent_test_messages of their agency"
ON public.agent_test_messages FOR DELETE
TO authenticated
USING (
    session_id IN (
        SELECT id FROM public.agent_test_sessions WHERE agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
        )
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_agent_test_sessions_updated_at
BEFORE UPDATE ON public.agent_test_sessions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_test_sessions_agency_id ON public.agent_test_sessions(agency_id);
CREATE INDEX IF NOT EXISTS idx_agent_test_sessions_agent_id ON public.agent_test_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_test_messages_session_id ON public.agent_test_messages(session_id);

-- Grant privileges
GRANT ALL ON TABLE public.agent_test_sessions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.agent_test_messages TO anon, authenticated, service_role;

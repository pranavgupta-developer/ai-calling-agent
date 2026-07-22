-- Update ai_agents table
ALTER TABLE public.ai_agents
ADD COLUMN voice_enabled BOOLEAN DEFAULT false,
ADD COLUMN voice_status TEXT CHECK (voice_status IN ('inactive', 'provisioning', 'active', 'suspended', 'failed'));

-- Create agent_voice_configs table
CREATE TABLE public.agent_voice_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL UNIQUE REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'openai',
    voice_model TEXT,
    voice_name TEXT,
    language TEXT DEFAULT 'en',
    greeting_message TEXT,
    system_voice_instructions TEXT,
    record_calls BOOLEAN DEFAULT false,
    transcribe_calls BOOLEAN DEFAULT true,
    max_call_duration INTEGER DEFAULT 900,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_agent_voice_configs_agency_id ON public.agent_voice_configs(agency_id);
CREATE INDEX idx_agent_voice_configs_agent_id ON public.agent_voice_configs(agent_id);

-- Create agent_phone_numbers table
CREATE TABLE public.agent_phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL UNIQUE REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE,
    twilio_sid TEXT UNIQUE,
    country_code TEXT,
    status TEXT CHECK (status IN ('provisioning', 'active', 'released', 'failed')),
    voice_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_agent_phone_numbers_agency_id ON public.agent_phone_numbers(agency_id);
CREATE INDEX idx_agent_phone_numbers_agent_id ON public.agent_phone_numbers(agent_id);

-- Create voice_calls table
CREATE TABLE public.voice_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    twilio_call_sid TEXT UNIQUE,
    caller_number TEXT,
    status TEXT CHECK (status IN ('ringing', 'in_progress', 'completed', 'failed')),
    duration INTEGER,
    recording_url TEXT,
    transcript TEXT,
    appointment_id UUID NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_voice_calls_agency_id ON public.voice_calls(agency_id);
CREATE INDEX idx_voice_calls_agent_id ON public.voice_calls(agent_id);

-- Create voice_usage table
CREATE TABLE public.voice_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    total_calls INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_voice_usage_agency_id ON public.voice_usage(agency_id);
CREATE INDEX idx_voice_usage_agent_id ON public.voice_usage(agent_id);

-- Create voice_audit_logs table
CREATE TABLE public.voice_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_voice_audit_logs_agency_id ON public.voice_audit_logs(agency_id);
CREATE INDEX idx_voice_audit_logs_agent_id ON public.voice_audit_logs(agent_id);


-- Row Level Security (RLS)

ALTER TABLE public.agent_voice_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_audit_logs ENABLE ROW LEVEL SECURITY;

-- agent_voice_configs policies
CREATE POLICY "Users can view their agency voice configs"
ON public.agent_voice_configs FOR SELECT
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their agency voice configs"
ON public.agent_voice_configs FOR ALL
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- agent_phone_numbers policies
CREATE POLICY "Users can view their agency phone numbers"
ON public.agent_phone_numbers FOR SELECT
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their agency phone numbers"
ON public.agent_phone_numbers FOR ALL
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- voice_calls policies
CREATE POLICY "Users can view their agency voice calls"
ON public.voice_calls FOR SELECT
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their agency voice calls"
ON public.voice_calls FOR ALL
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- voice_usage policies
CREATE POLICY "Users can view their agency voice usage"
ON public.voice_usage FOR SELECT
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their agency voice usage"
ON public.voice_usage FOR ALL
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- voice_audit_logs policies
CREATE POLICY "Users can view their agency voice audit logs"
ON public.voice_audit_logs FOR SELECT
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their agency voice audit logs"
ON public.voice_audit_logs FOR ALL
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Set up trigger for updated_at
CREATE TRIGGER set_updated_at_agent_voice_configs
    BEFORE UPDATE ON public.agent_voice_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_agent_phone_numbers
    BEFORE UPDATE ON public.agent_phone_numbers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

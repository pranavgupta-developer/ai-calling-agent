-- Migration: Appointment Lifecycle Engine
-- Extends appointment_events and adds email_jobs for the outbox pattern

-- 1. Extend appointment_events (additive)
ALTER TABLE public.appointment_events
ADD COLUMN IF NOT EXISTS previous_status public.appointment_status,
ADD COLUMN IF NOT EXISTS new_status public.appointment_status,
ADD COLUMN IF NOT EXISTS performed_by_name TEXT,
ADD COLUMN IF NOT EXISTS performed_by_email TEXT,
ADD COLUMN IF NOT EXISTS channel TEXT,
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 2. Email Jobs (Outbox Pattern)
DO $$ BEGIN
    CREATE TYPE public.email_job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.email_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    template TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status public.email_job_status NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for email_jobs updated_at
DROP TRIGGER IF EXISTS update_email_jobs_updated_at ON public.email_jobs;
CREATE TRIGGER update_email_jobs_updated_at
BEFORE UPDATE ON public.email_jobs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for email_jobs
CREATE INDEX IF NOT EXISTS idx_email_jobs_agency_id ON public.email_jobs(agency_id);
CREATE INDEX IF NOT EXISTS idx_email_jobs_status ON public.email_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_jobs_appointment_id ON public.email_jobs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_email_jobs_created_at ON public.email_jobs(created_at);

-- RLS for email_jobs
ALTER TABLE public.email_jobs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.email_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.email_jobs TO service_role;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view email jobs of their agency" ON public.email_jobs;
    DROP POLICY IF EXISTS "Users can insert email jobs for their agency" ON public.email_jobs;
    DROP POLICY IF EXISTS "Users can update email jobs for their agency" ON public.email_jobs;
END $$;

CREATE POLICY "Users can view email jobs of their agency"
ON public.email_jobs FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert email jobs for their agency"
ON public.email_jobs FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update email jobs for their agency"
ON public.email_jobs FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

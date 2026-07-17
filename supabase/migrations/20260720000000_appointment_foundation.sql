-- Migration: Create Appointment Foundation
-- Creates clients, appointments, appointment_events, business_hours, business_hour_exceptions, and calendar_accounts.

-- 1. Drop existing appointments table if it exists to replace with the new schema
DROP TABLE IF EXISTS public.appointments CASCADE;

-- 2. Enums (Idempotent creation)
DO $$ BEGIN
    CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('unpaid', 'pending', 'paid_cash', 'paid_online', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.appointment_source AS ENUM ('dashboard', 'website', 'widget', 'voice', 'whatsapp', 'sms', 'api');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.appointment_type AS ENUM ('property_viewing', 'consultation', 'investment', 'rental', 'commercial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.client_source AS ENUM ('website', 'widget', 'voice', 'manual', 'import');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 3. Tables

-- Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en',
    source public.client_source DEFAULT 'manual',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT clients_email_agency_unique UNIQUE (agency_id, email),
    CONSTRAINT clients_phone_agency_unique UNIQUE (agency_id, phone)
);

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Appointments Table (Recreated)
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    ai_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    appointment_type public.appointment_type NOT NULL DEFAULT 'consultation',
    appointment_source public.appointment_source NOT NULL DEFAULT 'dashboard',
    status public.appointment_status NOT NULL DEFAULT 'pending',
    payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    client_notes TEXT,
    internal_notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by_ai BOOLEAN NOT NULL DEFAULT false,
    ai_confidence_score DECIMAL(5,2),
    google_calendar_event_id TEXT,
    outlook_calendar_event_id TEXT,
    meeting_url TEXT,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT appointments_end_after_start CHECK (end_time > start_time),
    CONSTRAINT appointments_duration_positive CHECK (duration_minutes > 0)
);

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Appointment Events Table
CREATE TABLE IF NOT EXISTS public.appointment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    performed_by UUID,
    performed_by_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business Hours Table
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
    opens_at TIME NOT NULL DEFAULT '09:00:00',
    closes_at TIME NOT NULL DEFAULT '17:00:00',
    break_start TIME,
    break_end TIME,
    is_open BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_business_hours_updated_at ON public.business_hours;
CREATE TRIGGER update_business_hours_updated_at
BEFORE UPDATE ON public.business_hours
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Business Hour Exceptions Table
CREATE TABLE IF NOT EXISTS public.business_hour_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT true,
    opens_at TIME,
    closes_at TIME,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Calendar Accounts Table
CREATE TABLE IF NOT EXISTS public.calendar_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
    calendar_id TEXT NOT NULL,
    sync_enabled BOOLEAN NOT NULL DEFAULT false,
    provider_account_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_calendar_accounts_updated_at ON public.calendar_accounts;
CREATE TRIGGER update_calendar_accounts_updated_at
BEFORE UPDATE ON public.calendar_accounts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();


-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_clients_agency_id ON public.clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);

CREATE INDEX IF NOT EXISTS idx_appointments_agency_id ON public.appointments(agency_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_listing_id ON public.appointments(listing_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_ai_agent_id ON public.appointments(ai_agent_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON public.appointments(deleted_at);

-- Composite Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_agency_start_time ON public.appointments(agency_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_agency_status ON public.appointments(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_agency_client ON public.appointments(agency_id, client_id);

CREATE INDEX IF NOT EXISTS idx_appointment_events_appointment_id ON public.appointment_events(appointment_id);
CREATE INDEX IF NOT EXISTS idx_business_hours_agency_id ON public.business_hours(agency_id);
CREATE INDEX IF NOT EXISTS idx_business_hour_exceptions_agency_date ON public.business_hour_exceptions(agency_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_accounts_agency_id ON public.calendar_accounts(agency_id);

-- 5. RLS Policies

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hour_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_accounts ENABLE ROW LEVEL SECURITY;

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.clients TO service_role;
GRANT SELECT ON TABLE public.clients TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointments TO service_role;
GRANT SELECT ON TABLE public.appointments TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointment_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointment_events TO service_role;
GRANT SELECT ON TABLE public.appointment_events TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_hours TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_hours TO service_role;
GRANT SELECT ON TABLE public.business_hours TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_hour_exceptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_hour_exceptions TO service_role;
GRANT SELECT ON TABLE public.business_hour_exceptions TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.calendar_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.calendar_accounts TO service_role;
GRANT SELECT ON TABLE public.calendar_accounts TO anon;

-- Drop existing policies if they exist (for idempotency since we are recreating tables/policies)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view clients of their agency" ON public.clients;
    DROP POLICY IF EXISTS "Users can insert clients for their agency" ON public.clients;
    DROP POLICY IF EXISTS "Users can update clients for their agency" ON public.clients;
    DROP POLICY IF EXISTS "Users can delete clients for their agency" ON public.clients;
    
    DROP POLICY IF EXISTS "Users can view appointments of their agency" ON public.appointments;
    DROP POLICY IF EXISTS "Users can insert appointments for their agency" ON public.appointments;
    DROP POLICY IF EXISTS "Users can update appointments for their agency" ON public.appointments;
    DROP POLICY IF EXISTS "Users can delete appointments for their agency" ON public.appointments;
    
    DROP POLICY IF EXISTS "Users can view appointment events of their agency" ON public.appointment_events;
    DROP POLICY IF EXISTS "Users can insert appointment events for their agency" ON public.appointment_events;
    
    DROP POLICY IF EXISTS "Users can view business hours of their agency" ON public.business_hours;
    DROP POLICY IF EXISTS "Users can insert business hours for their agency" ON public.business_hours;
    DROP POLICY IF EXISTS "Users can update business hours for their agency" ON public.business_hours;
    DROP POLICY IF EXISTS "Users can delete business hours for their agency" ON public.business_hours;
    
    DROP POLICY IF EXISTS "Users can view business hour exceptions of their agency" ON public.business_hour_exceptions;
    DROP POLICY IF EXISTS "Users can insert business hour exceptions for their agency" ON public.business_hour_exceptions;
    DROP POLICY IF EXISTS "Users can update business hour exceptions for their agency" ON public.business_hour_exceptions;
    DROP POLICY IF EXISTS "Users can delete business hour exceptions for their agency" ON public.business_hour_exceptions;
    
    DROP POLICY IF EXISTS "Users can view calendar accounts of their agency" ON public.calendar_accounts;
    DROP POLICY IF EXISTS "Users can insert calendar accounts for their agency" ON public.calendar_accounts;
    DROP POLICY IF EXISTS "Users can update calendar accounts for their agency" ON public.calendar_accounts;
    DROP POLICY IF EXISTS "Users can delete calendar accounts for their agency" ON public.calendar_accounts;
END $$;

-- Clients Policies
CREATE POLICY "Users can view clients of their agency"
ON public.clients FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
    AND deleted_at IS NULL
);

CREATE POLICY "Users can insert clients for their agency"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update clients for their agency"
ON public.clients FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
    AND deleted_at IS NULL
);

CREATE POLICY "Users can delete clients for their agency"
ON public.clients FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Appointments Policies
CREATE POLICY "Users can view appointments of their agency"
ON public.appointments FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
    AND deleted_at IS NULL
);

CREATE POLICY "Users can insert appointments for their agency"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update appointments for their agency"
ON public.appointments FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
    AND deleted_at IS NULL
);

CREATE POLICY "Users can delete appointments for their agency"
ON public.appointments FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Appointment Events Policies
CREATE POLICY "Users can view appointment events of their agency"
ON public.appointment_events FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert appointment events for their agency"
ON public.appointment_events FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Business Hours Policies
CREATE POLICY "Users can view business hours of their agency"
ON public.business_hours FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert business hours for their agency"
ON public.business_hours FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update business hours for their agency"
ON public.business_hours FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete business hours for their agency"
ON public.business_hours FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Business Hour Exceptions Policies
CREATE POLICY "Users can view business hour exceptions of their agency"
ON public.business_hour_exceptions FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert business hour exceptions for their agency"
ON public.business_hour_exceptions FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update business hour exceptions for their agency"
ON public.business_hour_exceptions FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete business hour exceptions for their agency"
ON public.business_hour_exceptions FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Calendar Accounts Policies
CREATE POLICY "Users can view calendar accounts of their agency"
ON public.calendar_accounts FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert calendar accounts for their agency"
ON public.calendar_accounts FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update calendar accounts for their agency"
ON public.calendar_accounts FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete calendar accounts for their agency"
ON public.calendar_accounts FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

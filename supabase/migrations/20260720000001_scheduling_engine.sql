-- Migration: Scheduling Engine
-- Adds scheduling_logs and safe RPC function for preventing double bookings

-- 1. Create scheduling_logs table
CREATE TABLE IF NOT EXISTS public.scheduling_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'availability_check', 'booking_attempt', 'booking_success', 'booking_failed'
    requested_slot TIMESTAMPTZ,
    status TEXT NOT NULL, -- 'success', 'error', 'conflict'
    execution_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for logs
CREATE INDEX IF NOT EXISTS idx_scheduling_logs_agency_id ON public.scheduling_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_logs_appointment_id ON public.scheduling_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_logs_created_at ON public.scheduling_logs(created_at);

-- RLS for scheduling_logs
ALTER TABLE public.scheduling_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scheduling_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scheduling_logs TO service_role;

CREATE POLICY "Users can view scheduling logs of their agency"
ON public.scheduling_logs FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert scheduling logs for their agency"
ON public.scheduling_logs FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);


-- 2. Safe Booking RPC (Prevents Double Booking)
CREATE OR REPLACE FUNCTION public.book_appointment_safe(
    p_agency_id UUID,
    p_client_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_duration_minutes INTEGER,
    p_timezone TEXT,
    p_appointment_type public.appointment_type,
    p_appointment_source public.appointment_source,
    p_listing_id UUID DEFAULT NULL,
    p_service_id UUID DEFAULT NULL,
    p_ai_agent_id UUID DEFAULT NULL,
    p_conversation_id UUID DEFAULT NULL,
    p_client_notes TEXT DEFAULT NULL,
    p_created_by_ai BOOLEAN DEFAULT FALSE,
    p_ai_confidence_score DECIMAL DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_appointment_id UUID;
    v_overlap_count INTEGER;
    v_lock_key BIGINT;
BEGIN
    -- 1. Create a 64-bit advisory lock key using hash of agency_id
    v_lock_key := hashtext(p_agency_id::text);
    
    -- Acquire transaction-level advisory lock
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- 2. Check for overlaps
    SELECT COUNT(*) INTO v_overlap_count
    FROM public.appointments
    WHERE agency_id = p_agency_id
      AND status IN ('pending', 'confirmed')
      AND deleted_at IS NULL
      AND start_time < p_end_time
      AND end_time > p_start_time;

    IF v_overlap_count > 0 THEN
        RAISE EXCEPTION 'DOUBLE_BOOKING_ERROR: The requested time slot is no longer available.';
    END IF;

    -- 3. Insert the appointment
    INSERT INTO public.appointments (
        agency_id,
        client_id,
        listing_id,
        service_id,
        ai_agent_id,
        conversation_id,
        appointment_type,
        appointment_source,
        start_time,
        end_time,
        duration_minutes,
        timezone,
        client_notes,
        created_by_ai,
        ai_confidence_score
    ) VALUES (
        p_agency_id,
        p_client_id,
        p_listing_id,
        p_service_id,
        p_ai_agent_id,
        p_conversation_id,
        p_appointment_type,
        p_appointment_source,
        p_start_time,
        p_end_time,
        p_duration_minutes,
        p_timezone,
        p_client_notes,
        p_created_by_ai,
        p_ai_confidence_score
    ) RETURNING id INTO v_appointment_id;

    RETURN v_appointment_id;
END;
$$;

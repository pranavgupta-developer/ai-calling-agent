-- Fix Infinite Recursion in RLS
-- Creates a SECURITY DEFINER function to fetch user agency IDs without triggering RLS recursively

CREATE OR REPLACE FUNCTION public.get_user_agency_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    UNION
    SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid();
$$;

-- Drop existing recursive policies
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


-- Recreate policies using the SECURITY DEFINER function

-- Clients
CREATE POLICY "Users can view clients of their agency" ON public.clients FOR SELECT TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()) AND deleted_at IS NULL);

CREATE POLICY "Users can insert clients for their agency" ON public.clients FOR INSERT TO authenticated
WITH CHECK (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can update clients for their agency" ON public.clients FOR UPDATE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()) AND deleted_at IS NULL);

CREATE POLICY "Users can delete clients for their agency" ON public.clients FOR DELETE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

-- Appointments
CREATE POLICY "Users can view appointments of their agency" ON public.appointments FOR SELECT TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()) AND deleted_at IS NULL);

CREATE POLICY "Users can insert appointments for their agency" ON public.appointments FOR INSERT TO authenticated
WITH CHECK (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can update appointments for their agency" ON public.appointments FOR UPDATE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()) AND deleted_at IS NULL);

CREATE POLICY "Users can delete appointments for their agency" ON public.appointments FOR DELETE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

-- Appointment Events
CREATE POLICY "Users can view appointment events of their agency" ON public.appointment_events FOR SELECT TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can insert appointment events for their agency" ON public.appointment_events FOR INSERT TO authenticated
WITH CHECK (agency_id IN (SELECT public.get_user_agency_ids()));

-- Business Hours
CREATE POLICY "Users can view business hours of their agency" ON public.business_hours FOR SELECT TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can insert business hours for their agency" ON public.business_hours FOR INSERT TO authenticated
WITH CHECK (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can update business hours for their agency" ON public.business_hours FOR UPDATE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can delete business hours for their agency" ON public.business_hours FOR DELETE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

-- Business Hour Exceptions
CREATE POLICY "Users can view business hour exceptions of their agency" ON public.business_hour_exceptions FOR SELECT TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can insert business hour exceptions for their agency" ON public.business_hour_exceptions FOR INSERT TO authenticated
WITH CHECK (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can update business hour exceptions for their agency" ON public.business_hour_exceptions FOR UPDATE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can delete business hour exceptions for their agency" ON public.business_hour_exceptions FOR DELETE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

-- Calendar Accounts
CREATE POLICY "Users can view calendar accounts of their agency" ON public.calendar_accounts FOR SELECT TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can insert calendar accounts for their agency" ON public.calendar_accounts FOR INSERT TO authenticated
WITH CHECK (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can update calendar accounts for their agency" ON public.calendar_accounts FOR UPDATE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

CREATE POLICY "Users can delete calendar accounts for their agency" ON public.calendar_accounts FOR DELETE TO authenticated
USING (agency_id IN (SELECT public.get_user_agency_ids()));

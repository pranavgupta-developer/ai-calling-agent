-- Fix for permission denied on agency_users

-- 1. Grant necessary table permissions to the authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agency_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agency_users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agency_users TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agencies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agencies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agencies TO service_role;

-- 2. Grant usage on sequences if there are any serial primary keys
-- (PostgreSQL sometimes requires USAGE on sequences for INSERTs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Seed script to ensure the required roles exist

-- 1. Ensure permissions on the roles table
GRANT SELECT ON TABLE public.roles TO authenticated;
GRANT SELECT ON TABLE public.roles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.roles TO service_role;

-- 2. If RLS is enabled, allow everyone to read from roles
-- (Uncomment the next line if you get errors running this)
-- ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read roles" ON public.roles;
CREATE POLICY "Anyone can read roles" 
ON public.roles FOR SELECT 
USING (true);

-- 3. Insert the default roles if they don't exist
INSERT INTO public.roles (name, description)
VALUES 
  ('OWNER', 'Full control over the agency account and billing'),
  ('ADMIN', 'Can manage all settings and users, except billing'),
  ('MANAGER', 'Can manage clients and AI agents, but not system settings'),
  ('AGENT', 'Can only view assigned leads and clients')
ON CONFLICT (name) DO NOTHING;

import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://example.supabase.co", "dummy-key");
supabase.auth.signUp({
  email: "test@example.com",
  password: "password123",
  phone: "+15555555555",
});

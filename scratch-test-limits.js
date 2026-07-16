const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users } = await supabase.auth.admin.listUsers();
  if (!users || users.users.length === 0) {
    console.log("No users found.");
    return;
  }
  const userId = users.users[0].id;
  
  const { data: agency } = await supabase.from("agencies").select("id").eq("owner_id", userId).single();
  if (!agency) {
    console.log("No agency found for user", userId);
    return;
  }
  
  const agencyId = agency.id;
  console.log("Agency ID:", agencyId);
  
  const { count, error } = await supabase.from("ai_agents").select("*", { count: "exact", head: true }).eq("agency_id", agencyId).is("deleted_at", null);
  console.log("Active Agents Count:", count, "Error:", error);

  const { count: totalCount } = await supabase.from("ai_agents").select("*", { count: "exact", head: true }).eq("agency_id", agencyId);
  console.log("Total Agents Count (including deleted):", totalCount);
}

check().catch(console.error);

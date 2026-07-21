import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data: users, error } = await supabase.auth.admin.listUsers()
  if (error) console.error(error)
  console.log("Users:", users?.users.map(u => ({ email: u.email, id: u.id })))

  const { data: profiles } = await supabase.from('client_profiles').select('id, email, auth_user_id')
  console.log("Client Profiles:", profiles)

  const { data: agencyUsers } = await supabase.from('agency_users').select('id, auth_user_id')
  console.log("Agency Users:", agencyUsers)
}
main()

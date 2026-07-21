import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'agencies' })
  // Let's just query pg_policy directly with a raw query if RPC isn't available
  // Wait, supabase-js can't query pg_catalog directly via Rest unless it's exposed.
}
main()

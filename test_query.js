const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://iyebetgiydlfoywhjmsk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZWJldGdpeWRsZm95d2hqbXNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzI3OTcyMCwiZXhwIjoyMDk4ODU1NzIwfQ.HmjXgtMousECOv10NHQNsKk1TFwhi5-AYCYuX1LHJds'
);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: "SELECT * FROM pg_policies WHERE tablename = 'appointments';" });
  
  if (error) {
    console.error('ERROR RPC:', error.message);
    // fallback, let's just query pg_policies if it's exposed, but it isn't.
    // Instead we can just fetch the policies via REST if we made a view, but we didn't.
  } else {
    console.log('POLICIES:', data);
  }
}

run();

import { createClient } from '@supabase/supabase-js';
import { search } from './lib/retrieval/search';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const res = await search(supabase, { query: 'test', agencyId: '103af097-8254-4a19-9976-b60ac5af7f62' });
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();

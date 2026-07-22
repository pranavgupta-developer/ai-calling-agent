import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: entries } = await supabase.from('knowledge_entries').select('id').limit(1);
  if (!entries || entries.length === 0) return console.log('No entries');
  
  const id = entries[0].id;
  console.log('Testing with ID:', id);

  const { data, error } = await supabase
    .from('knowledge_entries')
    .select(`
      *,
      category:knowledge_categories (name, color),
      services:knowledge_entry_services(service_id),
      listings:knowledge_entry_listings(listing_id)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error with knowledge_categories:', error);
  } else {
    console.log('Success with knowledge_categories!');
  }
  
  const { data: data2, error: error2 } = await supabase
    .from('knowledge_entries')
    .select(`
      *,
      category:category_id (name, color),
      services:knowledge_entry_services(service_id),
      listings:knowledge_entry_listings(listing_id)
    `)
    .eq('id', id)
    .single();

  if (error2) {
    console.error('Error with category_id:', error2);
  } else {
    console.log('Success with category_id!');
  }
}

run();

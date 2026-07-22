import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Check if there are any entries
  const { data: entries, error: fetchError } = await supabase
    .from('knowledge_entries')
    .select('id, question, answer, agency_id, embedding');

  console.log("Total entries in DB:", entries?.length);
  
  if (fetchError) {
    console.error("Fetch Error:", fetchError);
    return;
  }

  if (!entries || entries.length === 0) {
    console.log("No entries found in DB.");
    return;
  }

  const firstEntry = entries[0];
  console.log("First entry:", firstEntry.question);
  console.log("Has embedding:", !!firstEntry.embedding);
  
  // 2. Generate embedding for query
  const query = "What documents are required to buy a property?";
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
    encoding_format: 'float',
  });
  
  const queryEmbedding = response.data[0].embedding;
  console.log("Generated query embedding, length:", queryEmbedding.length);

  // 3. Test RPC
  const { data: vectorResults, error: rpcError } = await supabase.rpc('match_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: 0.3, // testing with low threshold
    match_count: 5,
    p_agency_id: firstEntry.agency_id
  });

  if (rpcError) {
    console.error("RPC Error:", rpcError);
  } else {
    console.log("RPC Results:", vectorResults?.length);
    console.log(vectorResults);
  }
}

run();

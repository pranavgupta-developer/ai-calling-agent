import { createClient } from "@supabase/supabase-js";
import { KNOWLEDGE_BASE_SEED_DATA } from "./knowledge-base-data";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key to bypass RLS for seeding, or standard anon key if service key isn't available.
// In a real production seed script, we should use SUPABASE_SERVICE_ROLE_KEY to insert across all agencies.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function normalizeText(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function seedKnowledgeBase() {
  console.log("Starting Knowledge Base seed...");

  try {
    // 1. Fetch all agencies
    const { data: agencies, error: agenciesError } = await supabase
      .from("agencies")
      .select("id, name");

    if (agenciesError) {
      throw new Error(`Failed to fetch agencies: ${agenciesError.message}`);
    }

    if (!agencies || agencies.length === 0) {
      console.log("No agencies found. Nothing to seed.");
      return;
    }

    console.log(`Found ${agencies.length} agencies. Processing...`);

    let totalInserted = 0;

    // 2. Loop through each agency
    for (const agency of agencies) {
      console.log(`\nProcessing agency: ${agency.name} (${agency.id})`);

      // 3. Fetch existing SYSTEM entries for this agency
      const { data: existingEntries, error: existingError } = await supabase
        .from("knowledge_base")
        .select("question")
        .eq("agency_id", agency.id)
        .eq("is_system", true);

      if (existingError) {
        console.error(`Error fetching existing entries for agency ${agency.id}:`, existingError.message);
        continue; // skip to next agency on error
      }

      const existingNormalizedQuestions = new Set(
        (existingEntries || []).map((entry) => normalizeText(entry.question))
      );

      // 4. Find which entries need to be inserted
      const entriesToInsert = KNOWLEDGE_BASE_SEED_DATA.filter((seedEntry) => {
        const normalizedSeedQuestion = normalizeText(seedEntry.question);
        return !existingNormalizedQuestions.has(normalizedSeedQuestion);
      }).map((entry) => ({
        ...entry,
        agency_id: agency.id,
        source: "SYSTEM",
        is_system: true,
        is_active: true,
      }));

      if (entriesToInsert.length === 0) {
        console.log(` - Agency ${agency.id} already has all SYSTEM knowledge base entries. Skipping.`);
        continue;
      }

      // 5. Bulk insert missing entries
      const { error: insertError } = await supabase
        .from("knowledge_base")
        .insert(entriesToInsert);

      if (insertError) {
        console.error(` - Error inserting entries for agency ${agency.id}:`, insertError.message);
      } else {
        console.log(` - Successfully inserted ${entriesToInsert.length} new entries for agency ${agency.id}`);
        totalInserted += entriesToInsert.length;
      }
    }

    console.log(`\nSeed completed successfully. Inserted a total of ${totalInserted} entries across all agencies.`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedKnowledgeBase();

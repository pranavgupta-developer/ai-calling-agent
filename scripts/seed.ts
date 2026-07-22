import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { seedKnowledgeBase } from "../supabase/seed/knowledge-base";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key to bypass RLS for seeding, or standard anon key if service key isn't available.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runGlobalSeed() {
  console.log("Starting Global Knowledge Base seed...");

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

    // 2. Loop through each agency and seed the new module
    for (const agency of agencies) {
      console.log(`\nProcessing agency: ${agency.name} (${agency.id})`);
      
      const res = await seedKnowledgeBase(supabase, agency.id);
      
      if (res.success) {
        console.log(` - Successfully seeded new knowledge module for agency ${agency.name}`);
      } else {
        console.error(` - Error seeding entries for agency ${agency.id}:`, res.error);
      }
    }

    console.log(`\nGlobal seed completed successfully.`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

runGlobalSeed();

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from("properties").select("*").limit(1);
  if (error) {
    console.error("Error fetching properties:", error);
  } else {
    console.log("Keys of a property:", data.length > 0 ? Object.keys(data[0]) : "No properties found");
  }
}

test();

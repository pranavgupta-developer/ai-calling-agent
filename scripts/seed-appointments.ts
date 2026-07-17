import { createClient } from "@supabase/supabase-js";
import { format, addDays } from "date-fns";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service role to bypass RLS in seeding

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting appointment seeding...");

  // 1. Get an existing agency
  const { data: agencies, error: agencyError } = await supabase
    .from("agencies")
    .select("id, owner_id")
    .limit(1);

  if (agencyError || !agencies?.length) {
    console.error("No agencies found. Cannot seed.");
    return;
  }
  const agency = agencies[0];
  const agencyId = agency.id;
  const ownerId = agency.owner_id;

  // 2. Clear old data for idempotency
  await supabase.from("appointments").delete().eq("agency_id", agencyId);
  await supabase.from("clients").delete().eq("agency_id", agencyId);
  await supabase.from("business_hours").delete().eq("agency_id", agencyId);

  // 3. Create Clients
  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .insert([
      {
        agency_id: agencyId,
        full_name: "Alice Johnson",
        email: "alice@example.com",
        phone: "+15550101",
        source: "website",
      },
      {
        agency_id: agencyId,
        full_name: "Bob Smith",
        email: "bob@example.com",
        phone: "+15550102",
        source: "manual",
      }
    ])
    .select();

  if (clientsError || !clients) {
    console.error("Failed to seed clients:", clientsError);
    return;
  }
  console.log(`Seeded ${clients.length} clients.`);

  // 4. Create Business Hours (Mon-Fri 9-5)
  const businessHoursData = [];
  for (let i = 0; i <= 6; i++) {
    businessHoursData.push({
      agency_id: agencyId,
      weekday: i,
      opens_at: "09:00",
      closes_at: "17:00",
      is_open: i >= 1 && i <= 5, // Mon-Fri
    });
  }

  const { error: hoursError } = await supabase.from("business_hours").insert(businessHoursData);
  if (hoursError) {
    console.error("Failed to seed business hours:", hoursError);
  } else {
    console.log("Seeded business hours.");
  }

  // 5. Create Appointments
  const today = new Date();
  
  const { data: appointments, error: apptError } = await supabase
    .from("appointments")
    .insert([
      {
        agency_id: agencyId,
        client_id: clients[0].id,
        appointment_type: "consultation",
        status: "confirmed",
        start_time: addDays(today, 1).toISOString(),
        end_time: addDays(today, 1).toISOString(),
        duration_minutes: 30,
        created_by: ownerId,
      },
      {
        agency_id: agencyId,
        client_id: clients[1].id,
        appointment_type: "property_viewing",
        status: "pending",
        start_time: addDays(today, 2).toISOString(),
        end_time: addDays(today, 2).toISOString(),
        duration_minutes: 60,
        created_by: ownerId,
      }
    ])
    .select();

  if (apptError || !appointments) {
    console.error("Failed to seed appointments:", apptError);
    return;
  }
  console.log(`Seeded ${appointments.length} appointments.`);

  // 6. Create Events
  const eventsData = appointments.map(appt => ({
    appointment_id: appt.id,
    agency_id: agencyId,
    event_type: "created",
    new_value: appt,
    performed_by: ownerId,
    performed_by_type: "user"
  }));

  const { error: eventsError } = await supabase.from("appointment_events").insert(eventsData);
  if (eventsError) {
    console.error("Failed to seed events:", eventsError);
  } else {
    console.log("Seeded appointment events.");
  }

  console.log("Seeding complete!");
}

// Allow running from CLI directly
if (typeof require !== 'undefined' && require.main === module) {
  seed();
}

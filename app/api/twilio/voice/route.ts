import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js"; // Using admin client for webhook (no user session)

export async function POST(req: Request) {
  try {
    // 1. Get raw form data from Twilio
    const formData = await req.formData();
    const to = formData.get("To") as string;
    const from = formData.get("From") as string;
    const callSid = formData.get("CallSid") as string;
    
    // 2. Validate Twilio signature (Optional but recommended in production)
    // We will assume it's valid for this implementation unless TWILIO_AUTH_TOKEN is strictly verified against headers
    
    // Setup Supabase Admin Client to bypass RLS for webhooks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Find To number & Identify agent
    const { data: phoneRecord, error: phoneError } = await supabase
      .from("agent_phone_numbers")
      .select("agent_id, agency_id")
      .eq("phone_number", to)
      .eq("status", "active")
      .single();

    if (phoneError || !phoneRecord) {
      console.error(`No agent found for number: ${to}`);
      const response = new twilio.twiml.VoiceResponse();
      response.say("Sorry, this number is not currently assigned to an active assistant.");
      return new NextResponse(response.toString(), {
        headers: { "Content-Type": "text/xml" }
      });
    }

    // 4. Log the incoming call
    await supabase.from("voice_calls").insert({
      agency_id: phoneRecord.agency_id,
      agent_id: phoneRecord.agent_id,
      twilio_call_sid: callSid,
      caller_number: from,
      status: "ringing",
      started_at: new Date().toISOString()
    });

    // 5. Load voice config
    const { data: config } = await supabase
      .from("agent_voice_configs")
      .select("*")
      .eq("agent_id", phoneRecord.agent_id)
      .single();

    const greeting = config?.greeting_message || "Connecting your AI assistant.";

    // 6. Return temporary TwiML (Preparing structure for future Twilio Media Stream -> OpenAI Realtime API)
    const response = new twilio.twiml.VoiceResponse();
    
    // For Week 6 Day 2-5: We will add <Connect><Stream .../></Connect> here
    response.say(greeting);
    response.pause({ length: 1 });
    response.say("This system is currently being provisioned with real-time intelligence. Goodbye!");
    
    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" }
    });

  } catch (error) {
    console.error("Webhook error:", error);
    const response = new twilio.twiml.VoiceResponse();
    response.say("An unexpected error occurred. Please try again later.");
    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" }
    });
  }
}

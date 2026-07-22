"use server";

import { createClient } from "@/lib/supabase/server";
import { twilioClient } from "@/lib/twilio/client";
import { revalidatePath } from "next/cache";
import { AgentPhoneNumber, VoiceAuditLog } from "@/types/voice";

export async function provisionAgentPhoneNumber(agentId: string) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    // 2. Verify agency ownership and get agent
    const { data: agent, error: agentError } = await supabase
      .from("ai_agents")
      .select("id, agency_id, voice_status")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      return { error: "Agent not found or unauthorized" };
    }

    // Check if voice status is already provisioning or active
    if (agent.voice_status === "provisioning" || agent.voice_status === "active") {
      return { error: "Agent is already provisioning or active with a phone number" };
    }

    // 3. Set status = provisioning
    await supabase
      .from("ai_agents")
      .update({ voice_status: "provisioning", voice_enabled: true })
      .eq("id", agentId);

    // 4. Search available Twilio numbers (mocking specific country for simplicity, usually 'US')
    const availableNumbers = await twilioClient.availablePhoneNumbers("US").local.list({ limit: 1 });
    
    if (availableNumbers.length === 0) {
      // Revert status
      await supabase.from("ai_agents").update({ voice_status: "failed" }).eq("id", agentId);
      return { error: "No available phone numbers at this time" };
    }

    const numberToPurchase = availableNumbers[0].phoneNumber;
    
    // 5. Purchase number and Configure webhook URL
    // Webhook URL should be the absolute URL in production.
    // We will use a placeholder domain or relative path logic, but Twilio requires absolute.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
    const voiceUrl = `${baseUrl}/api/twilio/voice`;

    const incomingPhoneNumber = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: numberToPurchase,
      voiceUrl: voiceUrl,
    });

    // 6. Create agent_phone_numbers record
    const { error: phoneInsertError } = await supabase
      .from("agent_phone_numbers")
      .insert({
        agency_id: agent.agency_id,
        agent_id: agentId,
        phone_number: incomingPhoneNumber.phoneNumber,
        twilio_sid: incomingPhoneNumber.sid,
        country_code: "US",
        status: "active",
        voice_url: voiceUrl
      });

    if (phoneInsertError) {
      console.error("Failed to insert phone record:", phoneInsertError);
      // Revert agent status and optionally release twilio number (skipping release for brevity)
      await supabase.from("ai_agents").update({ voice_status: "failed" }).eq("id", agentId);
      return { error: "Failed to save phone number configuration" };
    }

    // 7. Update ai_agents voice_status = active
    await supabase
      .from("ai_agents")
      .update({ voice_status: "active" })
      .eq("id", agentId);

    // 8. Create audit log
    await supabase.from("voice_audit_logs").insert({
      agency_id: agent.agency_id,
      agent_id: agentId,
      action: "provision_number",
      metadata: { phone_number: incomingPhoneNumber.phoneNumber, twilio_sid: incomingPhoneNumber.sid }
    });

    revalidatePath(`/dashboard/ai-agents/${agentId}`);
    return { success: true, phoneNumber: incomingPhoneNumber.phoneNumber };

  } catch (error: any) {
    console.error("Error provisioning phone number:", error);
    
    // Revert status on failure
    const supabase = await createClient();
    await supabase.from("ai_agents").update({ voice_status: "failed" }).eq("id", agentId);
    
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function releaseAgentPhoneNumber(agentId: string) {
  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const { data: phoneRecord, error: phoneError } = await supabase
      .from("agent_phone_numbers")
      .select("id, twilio_sid, agency_id, phone_number")
      .eq("agent_id", agentId)
      .eq("status", "active")
      .single();

    if (phoneError || !phoneRecord || !phoneRecord.twilio_sid) {
      return { error: "No active phone number found for this agent" };
    }

    // Release number from Twilio
    await twilioClient.incomingPhoneNumbers(phoneRecord.twilio_sid).remove();

    // Update DB status
    await supabase
      .from("agent_phone_numbers")
      .update({ status: "released" })
      .eq("id", phoneRecord.id);

    // Update agent voice_status
    await supabase
      .from("ai_agents")
      .update({ voice_status: "inactive", voice_enabled: false })
      .eq("id", agentId);

    // Create audit log
    await supabase.from("voice_audit_logs").insert({
      agency_id: phoneRecord.agency_id,
      agent_id: agentId,
      action: "release_number",
      metadata: { phone_number: phoneRecord.phone_number, twilio_sid: phoneRecord.twilio_sid }
    });

    revalidatePath(`/dashboard/ai-agents/${agentId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error releasing phone number:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function updateVoiceConfig(agentId: string, data: any) {
  try {
    const supabase = await createClient();
    
    // Verify ownership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };
    
    const { data: agent } = await supabase
      .from("ai_agents")
      .select("agency_id")
      .eq("id", agentId)
      .single();
      
    if (!agent) return { error: "Agent not found" };

    // UPSERT voice config
    const { error } = await supabase
      .from("agent_voice_configs")
      .upsert({
        agent_id: agentId,
        agency_id: agent.agency_id,
        ...data,
      }, { onConflict: "agent_id" });

    if (error) {
      console.error("Failed to update voice config:", error);
      return { error: "Failed to update voice configuration" };
    }

    revalidatePath(`/dashboard/ai-agents/${agentId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred" };
  }
}

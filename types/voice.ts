export type VoiceStatus =
  | 'inactive'
  | 'provisioning'
  | 'active'
  | 'suspended'
  | 'failed';

export interface AgentVoiceConfig {
  id: string;
  agency_id: string;
  agent_id: string;
  provider: string;
  voice_model: string | null;
  voice_name: string | null;
  language: string;
  greeting_message: string | null;
  system_voice_instructions: string | null;
  record_calls: boolean;
  transcribe_calls: boolean;
  max_call_duration: number;
  created_at: string;
  updated_at: string;
}

export interface AgentPhoneNumber {
  id: string;
  agency_id: string;
  agent_id: string;
  phone_number: string | null;
  twilio_sid: string | null;
  country_code: string | null;
  status: 'provisioning' | 'active' | 'released' | 'failed' | null;
  voice_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceCall {
  id: string;
  agency_id: string;
  agent_id: string;
  twilio_call_sid: string | null;
  caller_number: string | null;
  status: 'ringing' | 'in_progress' | 'completed' | 'failed' | null;
  duration: number | null;
  recording_url: string | null;
  transcript: string | null;
  appointment_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface VoiceUsage {
  id: string;
  agency_id: string;
  agent_id: string;
  month: string;
  total_calls: number;
  total_minutes: number;
  created_at: string;
}

export interface VoiceAuditLog {
  id: string;
  agency_id: string;
  agent_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

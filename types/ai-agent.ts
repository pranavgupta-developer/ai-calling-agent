export enum AgentProvider {
  OPENAI = "OpenAI",
  ANTHROPIC = "Anthropic",
  GOOGLE = "Google"
}

export enum AgentLanguage {
  ENGLISH = "English",
  HINDI = "Hindi",
  MARATHI = "Marathi",
  SPANISH = "Spanish",
  FRENCH = "French",
  GERMAN = "German",
  CUSTOM = "Custom"
}

export enum AgentVoice {
  ALLOY = "alloy",
  ECHO = "echo",
  FABLE = "fable",
  ONYX = "onyx",
  NOVA = "nova",
  SHIMMER = "shimmer"
}

export enum AgentPersonality {
  PROFESSIONAL = "Professional",
  FRIENDLY = "Friendly",
  LUXURY = "Luxury",
  SALES = "Sales",
  CONSULTANT = "Consultant",
  MINIMAL = "Minimal",
  CUSTOM = "Custom"
}

export type VoiceStatus =
  | 'inactive'
  | 'provisioning'
  | 'active'
  | 'suspended'
  | 'failed';


export interface AIAgent {
  id: string;
  agency_id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  greeting: string;
  personality: AgentPersonality | string;
  language: AgentLanguage | string;
  voice: AgentVoice | string;
  provider: AgentProvider | string;
  model: string;
  temperature: number;
  max_tokens: number;
  tool_permissions: Record<string, boolean>;
  fallback_mode: string;
  response_style: string;
  is_active: boolean;
  deleted_at: string | null;

  conversation_memory_settings: Record<string, unknown> | null;
  ai_persona_version: number | null;
  escalation_rules: Record<string, unknown> | null;
  working_hours_override: Record<string, unknown> | null;
  supported_communication_channels: string[] | null;
  knowledge_retrieval_configuration: Record<string, unknown> | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  
  voice_enabled: boolean;
  voice_status: VoiceStatus | null;
}

export interface CreateAIAgentInput {
  name: string;
  description?: string;
  system_prompt: string;
  greeting: string;
  personality: AgentPersonality | string;
  language: AgentLanguage | string;
  voice: AgentVoice | string;
  provider: AgentProvider | string;
  model: string;
  temperature?: number;
  max_tokens?: number;
  tool_permissions?: Record<string, boolean>;
  fallback_mode?: string;
  response_style?: string;
  is_active?: boolean;
}

export interface UpdateAIAgentInput extends Partial<CreateAIAgentInput> {
  id: string;
}

export interface AgentListing {
  id: string;
  agent_id: string;
  listing_id: string;
  created_at: string;
}

export interface AgentService {
  id: string;
  agent_id: string;
  service_id: string;
  created_at: string;
}

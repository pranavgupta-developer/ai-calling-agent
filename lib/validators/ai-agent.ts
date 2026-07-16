import { z } from "zod";
import { AgentProvider, AgentLanguage, AgentVoice, AgentPersonality } from "@/types/ai-agent";

export const CreateAIAgentSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(100, "Name cannot exceed 100 characters"),
  description: z.string().trim().optional(),
  system_prompt: z.string().trim().min(20, "System prompt must be at least 20 characters").max(5000, "System prompt cannot exceed 5000 characters"),
  greeting: z.string().trim().min(10, "Greeting must be at least 10 characters").max(500, "Greeting cannot exceed 500 characters"),
  personality: z.nativeEnum(AgentPersonality).or(z.string().trim().min(1, "Personality is required")),
  language: z.nativeEnum(AgentLanguage).or(z.string().trim().min(1, "Language is required")),
  voice: z.nativeEnum(AgentVoice).or(z.string().trim().min(1, "Voice is required")),
  provider: z.nativeEnum(AgentProvider).or(z.string().trim().min(1, "Provider is required")),
  model: z.string().trim().min(1, "Model is required"),
  temperature: z.number().min(0, "Temperature cannot be below 0").max(1, "Temperature cannot exceed 1"),
  max_tokens: z.number().int().min(100, "Max tokens must be at least 100").max(4000, "Max tokens cannot exceed 4000"),
  tool_permissions: z.record(z.string(), z.boolean()).optional(),
  fallback_mode: z.string().trim().optional(),
  response_style: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

export const UpdateAIAgentSchema = CreateAIAgentSchema.partial().extend({
  id: z.string().uuid("Invalid Agent ID"),
});

export const AssignListingSchema = z.object({
  agent_id: z.string().uuid("Invalid Agent ID"),
  listing_id: z.string().uuid("Invalid Listing ID"),
});

export const AssignServiceSchema = z.object({
  agent_id: z.string().uuid("Invalid Agent ID"),
  service_id: z.string().uuid("Invalid Service ID"),
});

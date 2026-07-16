"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { CreateAIAgentSchema } from "@/lib/validators/ai-agent";
import { AIAgent, AgentProvider, AgentLanguage, AgentVoice, AgentPersonality } from "@/types/ai-agent";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type AgentFormValues = z.infer<typeof CreateAIAgentSchema>;

interface AgentFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: AIAgent | null;
  onSubmit: (data: Record<string, unknown>) => Promise<{ error?: string; success?: boolean }>;
  onSuccess?: () => void;
}

export function AgentForm({ isOpen, onOpenChange, agent, onSubmit, onSuccess }: AgentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<AgentFormValues> = {
    name: "",
    description: "",
    system_prompt: "",
    greeting: "Hello! How can I help you today?",
    personality: AgentPersonality.PROFESSIONAL,
    language: AgentLanguage.ENGLISH,
    voice: AgentVoice.ALLOY,
    provider: AgentProvider.OPENAI,
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 1000,
    fallback_mode: "handoff_to_human",
    response_style: "standard",
    tool_permissions: {
      search_listings: true,
      get_listing_details: true,
      lookup_knowledge_base: true,
      check_available_slots: false,
      create_appointment: false,
      handoff_to_human: true,
    },
    is_active: true,
  };

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(CreateAIAgentSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      if (agent) {
        form.reset({
          name: agent.name,
          description: agent.description || "",
          system_prompt: agent.system_prompt,
          greeting: agent.greeting,
          personality: agent.personality,
          language: agent.language,
          voice: agent.voice,
          provider: agent.provider,
          model: agent.model,
          temperature: agent.temperature,
          max_tokens: agent.max_tokens,
          fallback_mode: agent.fallback_mode,
          response_style: agent.response_style,
          tool_permissions: agent.tool_permissions || defaultValues.tool_permissions,
          is_active: agent.is_active,
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [isOpen, agent, form]);

  const handleSubmit = async (data: AgentFormValues) => {
    try {
      setIsSubmitting(true);
      const result = await onSubmit(agent ? { id: agent.id, ...data } : data);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Agent ${agent ? 'updated' : 'created'} successfully`);
        if (onSuccess) onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{agent ? 'Edit AI Agent' : 'Create New AI Agent'}</SheetTitle>
          <SheetDescription>
            {agent ? 'Update the configuration for your AI agent.' : 'Configure a new AI agent for your agency.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="col-span-1 md:col-span-2 pb-2 border-b">
                <h3 className="text-sm font-semibold text-slate-800">Basic Info</h3>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Agent Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sales Assistant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the agent's purpose" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="greeting"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Greeting Message <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Hello! How can I help you today?" {...field} />
                    </FormControl>
                    <FormDescription>The first message spoken by the agent.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="system_prompt"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>System Prompt <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="You are a helpful real estate assistant..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Core instructions for the AI behavior.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-1 md:col-span-2 pb-2 border-b mt-4">
                <h3 className="text-sm font-semibold text-slate-800">Runtime Configuration</h3>
              </div>

              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Provider</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AgentProvider).map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gpt-4.5">gpt-4.5</SelectItem>
                        <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature ({field.value})</FormLabel>
                    <FormControl>
                      <Input 
                        type="range" 
                        step="0.1" 
                        min="0" 
                        max="1" 
                        value={field.value}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Creativity level (0 - 1)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_tokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="100" 
                        min="100" 
                        max="4000" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-1 md:col-span-2 pb-2 border-b mt-4">
                <h3 className="text-sm font-semibold text-slate-800">Behaviour & Style</h3>
              </div>

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AgentLanguage).map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="voice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voice</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AgentVoice).map((v) => (
                          <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="personality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select personality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AgentPersonality).map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="response_style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Style</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select response style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fallback_mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fallback Behaviour</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fallback mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="handoff_to_human">Handoff to Human</SelectItem>
                        <SelectItem value="apologize_and_end">Apologize and End</SelectItem>
                        <SelectItem value="take_message">Take Message</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-start-2">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable agent
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

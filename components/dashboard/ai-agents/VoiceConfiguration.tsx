"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Phone, Mic, Settings2, Trash2, Loader2, PhoneForwarded } from "lucide-react";

import { AIAgent } from "@/types/ai-agent";
import { AgentVoiceConfig, AgentPhoneNumber } from "@/types/voice";
import { provisionAgentPhoneNumber, releaseAgentPhoneNumber, updateVoiceConfig } from "@/app/actions/twilio";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VoiceConfigurationProps {
  agent: AIAgent;
  voiceConfig: AgentVoiceConfig | null;
  phoneNumber: AgentPhoneNumber | null;
}

export function VoiceConfiguration({ agent, voiceConfig, phoneNumber }: VoiceConfigurationProps) {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [language, setLanguage] = useState(voiceConfig?.language || "en");
  const [voiceModel, setVoiceModel] = useState(voiceConfig?.voice_model || "alloy");
  const [greeting, setGreeting] = useState(voiceConfig?.greeting_message || "");
  const [systemInstructions, setSystemInstructions] = useState(voiceConfig?.system_voice_instructions || "");
  const [recordCalls, setRecordCalls] = useState(voiceConfig?.record_calls || false);
  const [transcribeCalls, setTranscribeCalls] = useState(voiceConfig?.transcribe_calls ?? true);

  const handleProvision = async () => {
    setIsProvisioning(true);
    toast.info("Provisioning phone number...");
    
    try {
      const res = await provisionAgentPhoneNumber(agent.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Successfully provisioned: ${res.phoneNumber}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleRelease = async () => {
    setIsReleasing(true);
    
    try {
      const res = await releaseAgentPhoneNumber(agent.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Phone number released successfully");
        setIsReleaseDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to release phone number");
    } finally {
      setIsReleasing(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await updateVoiceConfig(agent.id, {
        language,
        voice_model: voiceModel,
        greeting_message: greeting,
        system_voice_instructions: systemInstructions,
        record_calls: recordCalls,
        transcribe_calls: transcribeCalls,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Voice configuration saved");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (!agent.voice_enabled) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    switch (agent.voice_status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'provisioning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Provisioning</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="text-red-500 border-red-500">Suspended</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Phone Number
              </CardTitle>
              <CardDescription className="mt-1">
                Assign a dedicated Twilio phone number to this AI agent.
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg border bg-slate-50/50">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <PhoneForwarded className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              {phoneNumber && phoneNumber.status === 'active' ? (
                <>
                  <h4 className="text-2xl font-bold tracking-tight mb-1">{phoneNumber.phone_number}</h4>
                  <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Ready to receive calls
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-lg font-medium mb-1">No Phone Number</h4>
                  <p className="text-sm text-muted-foreground">
                    Provision a number to enable voice capabilities for this agent.
                  </p>
                </>
              )}
            </div>
            <div className="shrink-0 flex gap-3">
              {phoneNumber && phoneNumber.status === 'active' ? (
                <Button 
                  variant="destructive" 
                  onClick={() => setIsReleaseDialogOpen(true)}
                  disabled={isReleasing}
                >
                  {isReleasing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Release Number
                </Button>
              ) : (
                <Button 
                  onClick={handleProvision} 
                  disabled={isProvisioning || agent.voice_status === 'provisioning'}
                >
                  {isProvisioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Provision Number
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Voice Configuration
          </CardTitle>
          <CardDescription>
            Customize how your AI agent sounds and behaves on phone calls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Voice Model</Label>
              <Select value={voiceModel} onValueChange={(val) => val && setVoiceModel(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                  <SelectItem value="echo">Echo (Male)</SelectItem>
                  <SelectItem value="fable">Fable (British)</SelectItem>
                  <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
                  <SelectItem value="nova">Nova (Female)</SelectItem>
                  <SelectItem value="shimmer">Shimmer (Clear Female)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={(val) => val && setLanguage(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="en-gb">English (UK)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Greeting Message</Label>
              <Input 
                placeholder="e.g. Hello! This is Alex from real estate. How can I help you today?" 
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">The first sentence the AI will say when the call connects.</p>
            </div>

            <div className="space-y-2">
              <Label>Voice-Specific Instructions</Label>
              <Textarea 
                placeholder="e.g. Speak slowly. Use a friendly and warm tone. Do not use complex jargon."
                className="min-h-[100px]"
                value={systemInstructions}
                onChange={(e) => setSystemInstructions(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Additional prompt instructions applied only to phone calls.</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Record Calls</Label>
                <p className="text-sm text-muted-foreground">
                  Record audio of the conversations for quality assurance.
                </p>
              </div>
              <Switch 
                checked={recordCalls}
                onCheckedChange={setRecordCalls}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Transcribe Calls</Label>
                <p className="text-sm text-muted-foreground">
                  Generate text transcripts of the conversations.
                </p>
              </div>
              <Switch 
                checked={transcribeCalls}
                onCheckedChange={setTranscribeCalls}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Voice Settings
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Release Phone Number?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to release this phone number? Your agent will lose its voice capabilities and the number cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReleasing}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleRelease} disabled={isReleasing}>
              {isReleasing ? "Releasing..." : "Release Number"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Temporary workaround to use Plus icon since I forgot to import it from lucide-react at the top
import { Plus } from "lucide-react";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bot, FileText, Mic } from 'lucide-react';

interface AppointmentConversationProps {
  conversationData?: any;
}

export function AppointmentConversation({ conversationData }: AppointmentConversationProps) {
  // Use mock data if none provided, or real data when Week 6 is ready.
  const data = conversationData || {
    summary: "The client expressed strong interest in a 2-bedroom downtown apartment. They are pre-approved for a mortgage and looking to move within the next 3 months.",
    lead_qualification: "High",
    budget: "$500k - $750k",
    intent: "Buying a Property",
    transcript: "AI: Hello, how can I help you today?\nClient: I'm looking for a 2BR apartment downtown.\nAI: Great! What is your budget?",
    confidence_score: 92
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Bot className="h-4 w-4" /> AI Conversation Context
        </h3>
        <div className="p-4 rounded-lg border bg-card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Intent Extracted</p>
              <Badge variant="secondary">{data.intent}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Lead Qualification</p>
              <Badge 
                variant="outline" 
                className={
                  data.lead_qualification === 'High' ? 'bg-green-100 text-green-800' :
                  data.lead_qualification === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''
                }
              >
                {data.lead_qualification}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Budget Detected</p>
              <p className="text-sm font-medium">{data.budget}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Confidence Score</p>
              <p className="text-sm font-medium">{data.confidence_score}%</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm font-medium mb-1">Summary</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.summary}
            </p>
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <FileText className="mr-2 h-4 w-4" /> View Full Transcript
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              <Mic className="mr-2 h-4 w-4" /> Play Recording
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

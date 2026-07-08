import { HeadphonesIcon, Mail, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ClientSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
        <p className="text-sm text-muted-foreground">
          Get help from our team or browse frequently asked questions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Live Chat",
            description: "Chat with a support agent in real-time.",
            icon: MessageSquareText,
            action: "Start Chat",
          },
          {
            title: "Email Support",
            description: "Send us an email and we'll respond within 24 hours.",
            icon: Mail,
            action: "Send Email",
          },
          {
            title: "Phone Support",
            description: "Speak with a support specialist directly.",
            icon: HeadphonesIcon,
            action: "Call Support",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <item.icon className="size-5 text-primary" />
            </div>
            <h2 className="mt-4 font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.description}
            </p>
            <Button className="mt-4" variant="outline" size="sm">
              {item.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

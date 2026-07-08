import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track call performance, lead conversion rates, and team productivity.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
        <BarChart3 className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">
          Analytics coming soon
        </h2>
        <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
          Once your AI agents start handling calls, detailed analytics including
          call volume, qualification rates, and conversion metrics will appear
          here.
        </p>
      </div>
    </div>
  );
}

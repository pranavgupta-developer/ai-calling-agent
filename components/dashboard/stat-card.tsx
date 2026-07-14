import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  className,
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 transition hover:border-border/80 hover:shadow-sm ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground/60" />
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {change && (
        <p className="mt-1 text-xs text-muted-foreground">{change}</p>
      )}
    </div>
  );
}

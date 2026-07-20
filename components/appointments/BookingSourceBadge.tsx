import { Badge } from '@/components/ui/badge';
import { AppointmentSource } from '@/types/appointments';
import { cn } from '@/lib/utils';
import { Globe, LayoutTemplate, Phone, MessageSquare, Smartphone, Link } from 'lucide-react';

const sourceConfig: Record<AppointmentSource, { label: string; icon: any; className?: string }> = {
  dashboard: { label: 'Dashboard', icon: LayoutTemplate, className: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
  website: { label: 'Website Form', icon: Globe, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  widget: { label: 'Widget', icon: Smartphone, className: 'bg-purple-100 text-purple-800 border-purple-200' },
  voice: { label: 'Voice AI', icon: Phone, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, className: 'bg-green-100 text-green-800 border-green-200' },
  sms: { label: 'SMS', icon: MessageSquare, className: 'bg-sky-100 text-sky-800 border-sky-200' },
  api: { label: 'API', icon: Link, className: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export function BookingSourceBadge({ source, className }: { source: AppointmentSource; className?: string }) {
  const config = sourceConfig[source] || { label: source, icon: Globe, className: 'bg-gray-100' };
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', config.className, className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

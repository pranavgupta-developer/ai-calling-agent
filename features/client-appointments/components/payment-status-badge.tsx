import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '@/types/appointments';
import { CreditCard, Banknote, XOctagon, RefreshCcw, DollarSign } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  switch (status) {
    case 'unpaid':
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
          <XOctagon className="w-3 h-3 mr-1" /> Unpaid
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <RefreshCcw className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    case 'paid_online':
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CreditCard className="w-3 h-3 mr-1" /> Paid Online
        </Badge>
      );
    case 'paid_cash':
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <Banknote className="w-3 h-3 mr-1" /> Paid Cash
        </Badge>
      );
    case 'refunded':
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          <DollarSign className="w-3 h-3 mr-1" /> Refunded
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
}

import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '@/types/appointments';
import { Clock, CheckCircle2, XCircle, CheckSquare, HelpCircle } from 'lucide-react';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    case 'confirmed':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckSquare className="w-3 h-3 mr-1" /> Completed
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" /> Cancelled
        </Badge>
      );
    case 'no_show':
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <HelpCircle className="w-3 h-3 mr-1" /> No Show
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

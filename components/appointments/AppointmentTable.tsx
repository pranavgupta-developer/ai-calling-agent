'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { BookingSourceBadge } from './BookingSourceBadge';
import { format } from 'date-fns';
import { MoreHorizontal, Calendar as CalendarIcon, Clock, User, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentTableProps {
  appointments: any[];
  onView: (id: string) => void;
}

export function AppointmentTable({ appointments, onView }: AppointmentTableProps) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card">
        <CalendarIcon className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No appointments found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          There are no appointments matching your current filters. Try clearing filters or create a new appointment.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => (
            <TableRow key={apt.id} className="group cursor-pointer" onClick={() => onView(apt.id)}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {apt.client?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{apt.client?.full_name || 'Unknown Client'}</span>
                    <span className="text-xs text-muted-foreground">{apt.client?.email || apt.client?.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex items-center text-sm font-medium">
                    <CalendarIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                    {format(new Date(apt.start_time), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <Clock className="mr-1 h-3 w-3" />
                    {format(new Date(apt.start_time), 'h:mm a')} ({apt.duration_minutes}m)
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <AppointmentStatusBadge status={apt.status} />
              </TableCell>
              <TableCell>
                <BookingSourceBadge source={apt.appointment_source} />
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={apt.payment_status} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => onView(apt.id)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

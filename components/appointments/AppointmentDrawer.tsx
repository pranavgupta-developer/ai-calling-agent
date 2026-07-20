'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { AppointmentConversation } from './AppointmentConversation';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Bot, 
  FileText,
  CreditCard,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AppointmentDrawerProps {
  appointmentId: string | null;
  onClose: () => void;
  appointmentData?: any; // Mock passing data for now, could fetch inside based on ID
}

export function AppointmentDrawer({ appointmentId, onClose, appointmentData }: AppointmentDrawerProps) {
  // In a real implementation, you might fetch data here if not provided, or use SWR/React Query.
  // For now, we assume `appointmentData` is passed or mocked if `appointmentId` is present.
  
  const apt = appointmentData || {
    id: appointmentId,
    status: 'pending',
    payment_status: 'unpaid',
    start_time: new Date().toISOString(),
    duration_minutes: 30,
    appointment_source: 'dashboard',
    client: {
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555-123-4567'
    },
    client_notes: 'Looking for a 2BR apartment near downtown.',
    internal_notes: 'VIP client, showed high interest in the luxury segment.',
    created_at: new Date().toISOString()
  };

  if (!appointmentId) return null;

  return (
    <Sheet open={!!appointmentId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0 flex flex-col h-full bg-background border-l">
        <SheetHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <SheetTitle className="text-xl">Appointment Details</SheetTitle>
            <div className="flex items-center gap-2">
              <AppointmentStatusBadge status={apt.status} />
              <PaymentStatusBadge status={apt.payment_status} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0">
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background hover:bg-accent h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Confirm
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> Complete
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarIcon className="mr-2 h-4 w-4" /> Reschedule
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="ai">AI Info</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-0">
              {/* Schedule Section */}
              <section className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Schedule
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-card">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">{format(new Date(apt.start_time), 'EEEE, MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time</p>
                    <p className="font-medium">{format(new Date(apt.start_time), 'h:mm a')} ({apt.duration_minutes} min)</p>
                  </div>
                </div>
              </section>

              {/* Client Section */}
              <section className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4" /> Client Information
                </h3>
                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                      {apt.client?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-base">{apt.client?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" /> {apt.client?.email || 'No email provided'}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{apt.client?.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </section>

              {/* Property Placeholder */}
              <section className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Property Details
                </h3>
                <div className="p-4 rounded-lg border border-dashed bg-card/50 flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                  <MapPin className="h-8 w-8 mb-2 opacity-50" />
                  <p>No property associated with this appointment.</p>
                  <Button variant="link" className="mt-1 h-auto p-0">Link a Listing</Button>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6 mt-0">
              <AppointmentConversation />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6 mt-0">
               {/* Timeline component will go here */}
               <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                  Timeline features coming soon.
               </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 mt-0">
              <section className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Internal Notes
                </h3>
                <div className="p-4 rounded-lg border bg-card/50 text-sm">
                  {apt.internal_notes || <span className="italic text-muted-foreground">No internal notes.</span>}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4" /> Client Notes
                </h3>
                <div className="p-4 rounded-lg border bg-card/50 text-sm">
                  {apt.client_notes || <span className="italic text-muted-foreground">No client notes.</span>}
                </div>
              </section>
            </TabsContent>

          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

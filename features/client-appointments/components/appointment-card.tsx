import { ClientAppointmentWithDetails } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { AppointmentStatusBadge } from './appointment-status-badge';
import { PaymentStatusBadge } from './payment-status-badge';
import { MapPin, Calendar, Clock, Building2, UserCircle, Image as ImageIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: ClientAppointmentWithDetails;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const property = appointment.property;
  const agency = appointment.agency;
  
  // Format Date and Time
  const startTime = parseISO(appointment.start_time);
  const formattedDate = format(startTime, 'EEEE, MMM do, yyyy');
  const formattedTime = format(startTime, 'h:mm a');
  
  // Display address
  const fullAddress = property
    ? [property.address, property.city, property.state].filter(Boolean).join(', ')
    : 'No location provided';

  // Format currency
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const agentName = appointment.agency_user 
    ? `${appointment.agency_user.first_name} ${appointment.agency_user.last_name}`
    : appointment.ai_agent?.name 
      ? `${appointment.ai_agent.name} (AI Assistant)`
      : 'Unassigned';

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-muted shrink-0 overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-accent/20">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-medium">No Image</span>
          </div>
          {/* Badges Floating on Image */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <AppointmentStatusBadge status={appointment.status} />
            <PaymentStatusBadge status={appointment.payment_status} />
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 p-5 md:p-6 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
            
            {/* Left Content */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                  {property?.title || 'Unknown Property'}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="line-clamp-1">{fullAddress}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="capitalize">{property?.property_type || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <UserCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="line-clamp-1">{agency?.name || 'Unknown Agency'}</span>
                </div>
                <div className="flex items-center text-primary/80 font-medium bg-primary/5 px-2 py-0.5 rounded-full">
                  {agentName}
                </div>
              </div>
              
              {property?.price && (
                <div className="font-semibold text-foreground">
                  {formatCurrency(property.price)} <span className="text-muted-foreground font-normal text-xs">{property.price_type}</span>
                </div>
              )}
            </div>

            {/* Right Content - Timing & Actions */}
            <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-4 md:mt-0 gap-4 shrink-0 p-4 md:p-0 bg-accent/20 md:bg-transparent rounded-lg border border-border/50 md:border-transparent">
              <div className="flex flex-col md:items-end gap-1 w-full">
                <div className="flex items-center text-foreground font-medium">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {formattedDate}
                </div>
                <div className="flex items-center text-muted-foreground text-sm ml-6 md:ml-0">
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  {formattedTime} <span className="mx-1">•</span> {appointment.duration_minutes} min
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap items-center gap-3 w-full border-t border-border/30 pt-4">
            <Link 
              href={`/client/appointments/${appointment.id}`}
              className={buttonVariants({ size: "sm", className: "flex-1 md:flex-none h-9 px-6 rounded-full shadow-sm hover:shadow" })}
            >
              View Details
            </Link>
            <Button size="sm" variant="outline" disabled className="flex-1 md:flex-none h-9 rounded-full bg-background/50 hover:bg-background">
              Reschedule
            </Button>
            <Button size="sm" variant="outline" disabled className="flex-1 md:flex-none h-9 rounded-full bg-background/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
              Cancel
            </Button>
            <div className="text-[10px] text-muted-foreground ml-auto hidden md:block">
              Ref: {appointment.id.split('-')[0].toUpperCase()}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

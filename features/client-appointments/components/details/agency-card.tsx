"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";

export function AgencyCard({ appointment }: { appointment: ClientAppointmentDetails }) {
  if (!appointment.agency) return null;

  const agency = appointment.agency;
  const addressParts = [agency.address_line_1, agency.city, agency.state, agency.country].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agency Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border shrink-0 overflow-hidden">
            {agency.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.logo_url} alt={agency.name} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base">{agency.name}</h3>
            <p className="text-muted-foreground text-xs">Partner Agency</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2">
          {agency.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`tel:${agency.phone}`} className="hover:underline hover:text-primary transition-colors">
                {agency.phone}
              </a>
            </div>
          )}
          {agency.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`mailto:${agency.email}`} className="hover:underline hover:text-primary transition-colors line-clamp-1">
                {agency.email}
              </a>
            </div>
          )}
          {agency.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={agency.website} target="_blank" rel="noreferrer" className="hover:underline hover:text-primary transition-colors line-clamp-1">
                {agency.website}
              </a>
            </div>
          )}
          {fullAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="leading-snug">{fullAddress}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

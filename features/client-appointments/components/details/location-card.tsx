"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function LocationCard({ appointment }: { appointment: ClientAppointmentDetails }) {
  if (!appointment.property) return null;

  const property = appointment.property;
  const addressParts = [property.address_line_1, property.city, property.state, property.country].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "Location not available";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">{fullAddress}</p>
        <div className="mt-4 w-full h-48 bg-muted rounded-md border flex items-center justify-center overflow-hidden relative">
          {/* Placeholder for Google Maps iframe */}
          <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px]" />
          <div className="relative text-center z-10 flex flex-col items-center">
            <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground font-medium">Map View</p>
            <p className="text-xs text-muted-foreground mt-1 px-4 text-center">Interactive map integration will be available in a future update.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

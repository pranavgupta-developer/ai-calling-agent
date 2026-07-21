"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Badge } from "@/components/ui/badge";
import { Wifi, Car, Dumbbell, Waves, ShieldCheck, TreePine, PawPrint, ArrowUpToLine, Wind } from "lucide-react";
import React from "react";

const getAmenityIcon = (amenity: string) => {
  const normalized = amenity.toLowerCase();
  if (normalized.includes("wifi") || normalized.includes("internet")) return <Wifi className="h-3 w-3 mr-1" />;
  if (normalized.includes("parking") || normalized.includes("garage")) return <Car className="h-3 w-3 mr-1" />;
  if (normalized.includes("gym") || normalized.includes("fitness")) return <Dumbbell className="h-3 w-3 mr-1" />;
  if (normalized.includes("pool")) return <Waves className="h-3 w-3 mr-1" />;
  if (normalized.includes("security")) return <ShieldCheck className="h-3 w-3 mr-1" />;
  if (normalized.includes("garden") || normalized.includes("park")) return <TreePine className="h-3 w-3 mr-1" />;
  if (normalized.includes("pet")) return <PawPrint className="h-3 w-3 mr-1" />;
  if (normalized.includes("lift") || normalized.includes("elevator")) return <ArrowUpToLine className="h-3 w-3 mr-1" />;
  if (normalized.includes("ac") || normalized.includes("air condition")) return <Wind className="h-3 w-3 mr-1" />;
  return null;
};

export function PropertyAmenities({ appointment }: { appointment: ClientAppointmentDetails }) {
  if (!appointment.property || !appointment.property.amenities || appointment.property.amenities.length === 0) {
    return null;
  }

  const { amenities } = appointment.property;

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-sm font-medium text-foreground">Features & Amenities</h3>
      <div className="flex flex-wrap gap-2">
        {amenities.map((amenity, index) => (
          <Badge key={index} variant="secondary" className="font-normal text-xs px-2.5 py-1">
            {getAmenityIcon(amenity)}
            {amenity}
          </Badge>
        ))}
      </div>
    </div>
  );
}

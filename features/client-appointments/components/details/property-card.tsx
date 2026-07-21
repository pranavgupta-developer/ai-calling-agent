"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, Bath, Car, Maximize, CalendarRange } from "lucide-react";

export function PropertyCard({ appointment }: { appointment: ClientAppointmentDetails }) {
  if (!appointment.property) return null;

  const property = appointment.property;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Property Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md gap-2">
            <Bed className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{property.bedrooms} Beds</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md gap-2">
            <Bath className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{property.bathrooms} Baths</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md gap-2">
            <Car className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{property.parking} Parking</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md gap-2">
            <Maximize className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{property.square_feet} sqft</span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Listing Type</span>
            <span className="font-medium capitalize">{property.listing_type}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Property Type</span>
            <span className="font-medium capitalize">{property.property_type.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Year Built</span>
            <span className="font-medium">{property.year_built || "N/A"}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">
              ${property.price.toLocaleString()} {property.price_type !== "fixed" ? `(${property.price_type})` : ""}
            </span>
          </div>
        </div>

        {property.description && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

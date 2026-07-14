import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Property } from "@/types/property";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building, ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface RecentListingsProps {
  properties: Property[];
}

export function RecentListings({ properties }: RecentListingsProps) {
  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-xl bg-muted/20">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Building className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Create your first property listing to start tracking your inventory and generating leads.
        </p>
        <Link href="/properties/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "sold":
        return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Link 
          key={property.id} 
          href={`/properties/${property.id}`}
          className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="relative h-16 w-16 sm:h-20 sm:w-24 shrink-0 rounded-lg overflow-hidden bg-muted">
            {property.cover_image_url ? (
              <Image
                src={property.cover_image_url}
                alt={property.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-medium truncate">{property.title}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {formatCurrency(property.price)} • {property.bedrooms} beds, {property.bathrooms} baths
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Added {formatDistanceToNow(new Date(property.created_at), { addSuffix: true })}
            </p>
          </div>
          
          <div className="hidden sm:block">
            <Badge className={getStatusColor(property.status)} variant="outline">
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

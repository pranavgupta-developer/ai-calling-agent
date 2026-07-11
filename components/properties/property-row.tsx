"use client";

import { useOptimistic, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Property } from "@/types/property";
import { StatusBadge } from "@/components/properties/status-badge";
import { Switch } from "@/components/ui/switch";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  togglePropertyActive,
  togglePropertyFeatured,
} from "@/lib/actions/properties/toggle-property";
import { deleteProperty } from "@/lib/actions/properties/delete-property";

// For INR formatting
const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

interface PropertyRowProps {
  property: Property;
}

export function PropertyRow({ property }: PropertyRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  // Optimistic UI for active and featured switches
  const [optimisticActive, addOptimisticActive] = useOptimistic(
    property.is_active ?? false,
    (_, newValue: boolean) => newValue
  );

  const [optimisticFeatured, addOptimisticFeatured] = useOptimistic(
    property.is_featured ?? false,
    (_, newValue: boolean) => newValue
  );

  const handleToggleActive = async (checked: boolean) => {
    startTransition(async () => {
      addOptimisticActive(checked);
      const result = await togglePropertyActive(property.id, checked);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Property marked as ${checked ? "active" : "inactive"}`);
      }
    });
  };

  const handleToggleFeatured = async (checked: boolean) => {
    startTransition(async () => {
      addOptimisticFeatured(checked);
      const result = await togglePropertyFeatured(property.id, checked);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Property ${checked ? "featured" : "unfeatured"}`);
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    
    setIsDeleting(true);
    const result = await deleteProperty(property.id); // Wait, I put delete in toggle-property. No, I put delete in delete-property.ts. Need to fix import.
    // I will fix the import below.
    if (result?.error) {
      toast.error(result.error);
      setIsDeleting(false);
    } else {
      toast.success("Property deleted");
    }
  };

  return (
    <TableRow className={isDeleting ? "opacity-50" : ""}>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="truncate max-w-[200px]">{property.title}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {property.property_type} • {property.listing_type}
          </span>
        </div>
      </TableCell>
      <TableCell>{formatINR(property.price)}</TableCell>
      <TableCell>
        <StatusBadge status={property.status} />
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formatDistanceToNow(new Date(property.created_at), { addSuffix: true })}
      </TableCell>
      <TableCell>
        <Switch
          checked={optimisticActive}
          onCheckedChange={handleToggleActive}
          disabled={isPending || isDeleting}
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={optimisticFeatured}
          onCheckedChange={handleToggleFeatured}
          disabled={isPending || isDeleting}
        />
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0")} disabled={isDeleting}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

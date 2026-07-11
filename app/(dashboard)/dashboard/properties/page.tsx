import { Building2, Plus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
          <p className="text-sm text-muted-foreground">
            Manage your property listings, track availability, and update
            details.
          </p>
        </div>
        <Link href="/dashboard/properties/new" className={buttonVariants({ className: "gap-2" })}>
          <Plus className="size-4" />
          Add Property
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
        <Building2 className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">No properties yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first property listing to get started.
        </p>
        <Link href="/dashboard/properties/new" className={buttonVariants({ variant: "outline", className: "mt-6 gap-2" })}>
          <Plus className="size-4" />
          Add Property
        </Link>
      </div>
    </div>
  );
}

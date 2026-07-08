import { Building2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

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
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Property
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
        <Building2 className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">No properties yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first property listing to get started.
        </p>
        <Button className="mt-6 gap-2" variant="outline">
          <Plus className="size-4" />
          Add Property
        </Button>
      </div>
    </div>
  );
}

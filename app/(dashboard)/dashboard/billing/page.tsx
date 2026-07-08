import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription plan, payment methods, and invoices.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
            <CreditCard className="size-5 text-blue-500" />
          </div>
          <div>
            <p className="font-semibold">Free Trial</p>
            <p className="text-sm text-muted-foreground">
              You&apos;re currently on the free trial plan.
            </p>
          </div>
        </div>
        <Button className="mt-4" variant="outline">
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
}

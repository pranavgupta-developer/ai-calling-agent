import { CreditCard } from "lucide-react";

export default function ClientPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">
          View your payment history and manage payment methods.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
        <CreditCard className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">No payments yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your payment history and invoices will appear here.
        </p>
      </div>
    </div>
  );
}

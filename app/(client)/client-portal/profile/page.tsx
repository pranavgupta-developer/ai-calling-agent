"use client";

import { User } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { Separator } from "@/components/ui/separator";

export default function ClientProfilePage() {
  const { user } = useAuth();

  const firstName = (user?.user_metadata?.first_name as string) ?? "";
  const lastName = (user?.user_metadata?.last_name as string) ?? "";
  const fullName =
    (user?.user_metadata?.full_name as string) ??
    ([firstName, lastName].filter(Boolean).join(" ") || "—");
  const phone = (user?.user_metadata?.phone as string) ?? "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your personal information.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <User className="size-7 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">{fullName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Full Name", value: fullName },
            { label: "Email", value: user?.email ?? "—" },
            { label: "Phone", value: phone },
            { label: "Account Type", value: "Client" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {field.label}
              </p>
              <p className="mt-1 text-sm font-medium">{field.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

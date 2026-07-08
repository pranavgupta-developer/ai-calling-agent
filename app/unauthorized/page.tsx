"use client";

import { ShieldAlert } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const { logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldAlert className="size-8 text-destructive" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Access Denied
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Your account is not linked to any agency or client workspace. Please
          contact your administrator to get access, or sign out and try a
          different account.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={logout} variant="outline">
            Sign Out
          </Button>
          <Button
            onClick={() => window.location.href = "mailto:support@realestateai.com"}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </main>
  );
}

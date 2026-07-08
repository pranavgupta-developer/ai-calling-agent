import { redirect } from "next/navigation";

import { getUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole(supabase, user.id);

  if (role === "CLIENT") {
    redirect("/client-portal");
  }

  if (!role) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}

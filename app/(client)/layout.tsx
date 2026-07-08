import { redirect } from "next/navigation";

import { getUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { ClientShell } from "@/components/client/client-shell";

export default async function ClientLayout({
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

  // Agency users should go to the agency dashboard
  if (role && role !== "CLIENT") {
    redirect("/dashboard");
  }

  if (!role) {
    redirect("/unauthorized");
  }

  return <ClientShell>{children}</ClientShell>;
}

import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "AGENT"
  | "CLIENT"
  | null;

const DASHBOARD_ROLES: UserRole[] = ["OWNER", "ADMIN", "MANAGER", "AGENT"];

export function getRedirectForRole(role: UserRole): string {
  if (role === "CLIENT") {
    return "/client/dashboard";
  }

  if (role && DASHBOARD_ROLES.includes(role)) {
    return "/dashboard";
  }

  return "/onboarding";
}

export async function getUserRole(
  supabase: SupabaseClient,
  authUserId: string
): Promise<UserRole> {
  const { data: agencyUser } = await supabase
    .from("agency_users")
    .select("roles(name)")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  const roleName = (
    agencyUser?.roles as { name?: string } | null | undefined
  )?.name;

  if (roleName && isUserRole(roleName)) {
    return roleName;
  }

  const { data: clientUser } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (clientUser) {
    return "CLIENT";
  }

  return null;
}

function isUserRole(value: string): value is Exclude<UserRole, null> {
  return ["OWNER", "ADMIN", "MANAGER", "AGENT", "CLIENT"].includes(value);
}

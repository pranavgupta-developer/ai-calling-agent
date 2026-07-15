import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolves the agency ID for a given authenticated user.
 * Checks if the user is an agency member, and if not, checks if they are the owner.
 */
export async function resolveAgencyId(
  supabase: SupabaseClient,
  authUserId: string
): Promise<string | null> {
  // 1. Check if they are a member of an agency via agency_users
  const { data: agencyUser } = await supabase
    .from("agency_users")
    .select("agency_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (agencyUser?.agency_id) {
    return agencyUser.agency_id;
  }

  // 2. Check if they are the owner of an agency
  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", authUserId)
    .maybeSingle();

  if (agency?.id) {
    return agency.id;
  }

  return null;
}

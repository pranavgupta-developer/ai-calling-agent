import { NextResponse } from "next/server";

import { getUserRole, type UserRole } from "@/lib/auth/roles";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET() {
  const supabase = await createRouteHandlerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ user: null, role: null, agency: null });
  }

  const role = await getUserRole(supabase, user.id);

  // If the user is an agency member, fetch their agency details
  let agency: {
    id: string;
    name: string;
    slug: string;
    email: string;
    logo_url: string | null;
    is_onboarding_completed: boolean;
  } | null = null;

  if (role && role !== "CLIENT") {
    const { data: agencyUser } = await supabase
      .from("agency_users")
      .select("agency_id, agencies(id, name, slug, email, logo_url, is_onboarding_completed)")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const agencyRecord = agencyUser?.agencies as
      | { id: string; name: string; slug: string; email: string; logo_url: string | null; is_onboarding_completed: boolean; }
      | null
      | undefined;

    if (agencyRecord) {
      agency = agencyRecord;
    }
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    },
    role,
    agency,
  });
}

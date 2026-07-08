import { NextResponse } from "next/server";

import { getUserRole, getRedirectForRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(origin);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=verification_failed`);
  }

  // Determine the user's role and redirect appropriately
  const role = await getUserRole(supabase, data.user.id);
  const redirectTo = getRedirectForRole(role);

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
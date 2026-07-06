import { NextResponse } from "next/server";

import { mapAuthError } from "@/lib/auth/errors";
import { getRedirectForRole, getUserRole } from "@/lib/auth/roles";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { validateLoginForm } from "@/lib/validations/login";

type LoginRequestBody = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
};

export async function POST(request: Request) {
  let body: LoginRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Something went wrong. Please try again." },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const rememberMe = Boolean(body.rememberMe);

  const fieldErrors = validateLoginForm({ email, password });
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        error: "validation",
        message: "Please fix the highlighted fields.",
        fields: fieldErrors,
      },
      { status: 400 }
    );
  }

  const supabase = await createRouteHandlerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const mapped = mapAuthError(error);
    return NextResponse.json(
      { error: mapped.code, message: mapped.message },
      { status: mapped.code === "too_many_attempts" ? 429 : 401 }
    );
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();

    return NextResponse.json(
      {
        error: "email_not_verified",
        message: "Your email address has not been verified.",
        email: data.user.email,
      },
      { status: 403 }
    );
  }

  const role = await getUserRole(supabase, data.user.id);
  const redirectTo = getRedirectForRole(role);

  const response = NextResponse.json({
    success: true,
    message: "Login successful",
    redirectTo,
    role,
  });

  if (!rememberMe) {
    response.cookies.set("reai-session-preference", "session", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
  } else {
    response.cookies.set("reai-session-preference", "persistent", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

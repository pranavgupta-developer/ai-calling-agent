import { NextResponse } from "next/server";

import { mapAuthError } from "@/lib/auth/errors";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

type ResendRequestBody = {
  email?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: ResendRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Something went wrong. Please try again." },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "validation", message: "Please enter a valid email." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;
  const supabase = await createRouteHandlerClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    const mapped = mapAuthError(error);
    return NextResponse.json(
      { error: mapped.code, message: mapped.message },
      { status: mapped.code === "too_many_attempts" ? 429 : 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Verification email sent successfully.",
  });
}

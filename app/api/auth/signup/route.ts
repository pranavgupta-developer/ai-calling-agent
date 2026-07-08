import { NextRequest, NextResponse } from "next/server";

import { mapAuthError } from "@/lib/auth/errors";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import {
  SignupFormData,
  validateSignupForm,
} from "@/lib/validations/signup";

export async function POST(request: NextRequest) {
  let body: SignupFormData;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_body", message: "Invalid request body." },
      { status: 400 }
    );
  }

  // ── Server-side validation ──
  const validationErrors = validateSignupForm(body);
  if (Object.keys(validationErrors).length > 0) {
    return NextResponse.json(
      {
        error: "validation",
        message: "Please fix the highlighted fields.",
        fields: validationErrors,
      },
      { status: 422 }
    );
  }

  // ── Create Supabase Auth user ──
  const supabase = await createRouteHandlerClient();

  const { error } = await supabase.auth.signUp({
    email: body.workEmail.trim(),
    password: body.password,
    phone: body.mobileNumber.trim(),
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      data: {
        agency_name: body.agencyName.trim(),
        agency_email: body.agencyEmail.trim(),
        business_phone: body.businessPhone.trim() || null,
        agency_website: body.agencyWebsite.trim() || null,
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        mobile_number: body.mobileNumber.trim(),
        job_title: body.jobTitle.trim() || null,
        marketing_opt_in: body.marketingOptIn,
      },
    },
  });

  if (error) {
    const mapped = mapAuthError({
      message: error.message,
      status: error.status,
      code: error.code,
    });

    return NextResponse.json(
      { error: mapped.code, message: mapped.message },
      { status: error.status ?? 400 }
    );
  }

  return NextResponse.json(
    {
      message: "Account created successfully.",
      email: body.workEmail.trim(),
    },
    { status: 201 }
  );
}

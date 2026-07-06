"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  SignupFormData,
  SignupFormErrors,
  validateSignupForm,
} from "@/lib/validations/signup";
import { cn } from "@/lib/utils";

const initialFormData: SignupFormData = {
  agencyName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K]
  ) {
    setFormData((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validateSignupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          agency_name: formData.agencyName.trim(),
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.phone.trim(),
        },
      },
    });

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    router.push(
      `/signup/check-email?email=${encodeURIComponent(formData.email.trim())}`
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold text-white hover:text-blue-400"
          >
            RealEstateAI
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-center text-3xl font-bold">Agency Signup</h1>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <FormField
              id="agencyName"
              label="Agency Name"
              value={formData.agencyName}
              error={errors.agencyName}
              onChange={(value) => updateField("agencyName", value)}
            />

            <FormField
              id="firstName"
              label="First Name"
              value={formData.firstName}
              error={errors.firstName}
              onChange={(value) => updateField("firstName", value)}
            />

            <FormField
              id="lastName"
              label="Last Name"
              value={formData.lastName}
              error={errors.lastName}
              onChange={(value) => updateField("lastName", value)}
            />

            <FormField
              id="email"
              label="Business Email"
              type="email"
              autoComplete="email"
              value={formData.email}
              error={errors.email}
              onChange={(value) => updateField("email", value)}
            />

            <FormField
              id="phone"
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              error={errors.phone}
              onChange={(value) => updateField("phone", value)}
            />

            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              error={errors.password}
              onChange={(value) => updateField("password", value)}
            />

            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              error={errors.confirmPassword}
              onChange={(value) => updateField("confirmPassword", value)}
            />

            <div>
              <label className="flex items-start gap-3 text-sm text-slate-300">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(event) =>
                    updateField("agreeToTerms", event.target.checked)
                  }
                  className="mt-1 size-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-400 hover:underline">
                    Terms &amp; Conditions
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms ? (
                <p className="mt-1.5 text-sm text-red-400">{errors.agreeToTerms}</p>
              ) : null}
            </div>

            {submitError ? (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-blue-600 text-base font-semibold hover:bg-blue-700"
            >
              {isSubmitting ? "Creating Account..." : "Create Agency Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

function FormField({
  id,
  label,
  value,
  error,
  type = "text",
  autoComplete,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-xl border bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-blue-500/40",
          error ? "border-red-500" : "border-slate-600 focus:border-blue-500"
        )}
      />
      {error ? <p className="mt-1.5 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

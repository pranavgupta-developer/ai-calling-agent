"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { AuthCard, AuthShell } from "@/components/auth/auth-shell";
import { LoginHero } from "@/components/auth/login-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter a valid email.");
      return;
    }

    setIsSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmedEmail,
      {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    );

    setIsSubmitting(false);

    if (resetError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSuccess("If an account exists for that email, a reset link has been sent.");
  }

  return (
    <AuthShell hero={<LoginHero />}>
      <AuthCard>
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Forgot Password</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Enter your email and we&apos;ll send you a secure link to reset your
            password.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@agency.com"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {success ? (
            <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              {success}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl text-sm font-semibold"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

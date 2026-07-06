"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

import { AuthCard } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  LoginFormErrors,
  validateLoginForm,
} from "@/lib/validations/login";

type LoginStatus = "idle" | "submitting" | "success" | "redirecting";

export function LoginForm() {
  const router = useRouter();
  const isSubmittingRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<LoginStatus>("idle");

  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const isBusy = status === "submitting" || status === "redirecting" || isResending;

  function clearFieldError(field: keyof LoginFormErrors) {
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

    if (isSubmittingRef.current) return;

    setFormError(null);
    setSuccessMessage(null);
    setResendSuccess(null);
    setShowVerificationPrompt(false);

    const trimmedEmail = email.trim();
    const validationErrors = validateLoginForm({
      email: trimmedEmail,
      password,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    isSubmittingRef.current = true;
    setStatus("submitting");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          rememberMe,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload.error === "validation" && payload.fields) {
          setErrors(payload.fields);
          setFormError(payload.message ?? "Please fix the highlighted fields.");
          setStatus("idle");
          return;
        }

        if (payload.error === "email_not_verified") {
          setShowVerificationPrompt(true);
          setVerificationEmail(payload.email ?? trimmedEmail);
          setFormError(payload.message);
          setStatus("idle");
          return;
        }

        setFormError(payload.message ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      setStatus("success");
      setSuccessMessage("Welcome back! Redirecting to your workspace...");
      setStatus("redirecting");

      window.setTimeout(() => {
        router.push(payload.redirectTo ?? "/dashboard");
        router.refresh();
      }, 900);
    } catch {
      setFormError("Network connection lost. Please check your connection.");
      setStatus("idle");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  async function handleResendVerification() {
    if (isResending || !verificationEmail) return;

    setIsResending(true);
    setResendSuccess(null);
    setFormError(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setFormError(payload.message ?? "Something went wrong. Please try again.");
        return;
      }

      setResendSuccess(payload.message ?? "Verification email sent successfully.");
    } catch {
      setFormError("Network connection lost. Please check your connection.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthCard>
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome Back</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Sign in to manage your agency, properties, leads, appointments, and AI
          calling assistant.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isBusy}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            placeholder="you@agency.com"
          />
          {errors.email ? (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary transition hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={isBusy}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              placeholder="Enter your password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password}
            </p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={rememberMe}
            disabled={isBusy}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="size-4 rounded border-input text-primary focus:ring-primary/30"
          />
          Remember Me
        </label>

        <AnimatePresence mode="wait">
          {formError ? (
            <motion.div
              key="form-error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {formError}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showVerificationPrompt ? (
            <motion.div
              key="verification-prompt"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4"
            >
              <p className="text-sm text-amber-100 dark:text-amber-50">
                Your email address has not been verified.
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={isResending}
                onClick={handleResendVerification}
                className="mt-3 h-9 rounded-xl"
              >
                {isResending ? (
                  <>
                    <Spinner className="mr-2" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {resendSuccess ? (
            <motion.p
              key="resend-success"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
            >
              {resendSuccess}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {successMessage ? (
            <motion.p
              key="success-message"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
            >
              {successMessage}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={isBusy}
          className={cn(
            "h-11 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/10",
            status === "success" || status === "redirecting"
              ? "bg-emerald-600 hover:bg-emerald-600"
              : ""
          )}
        >
          {status === "submitting" ? (
            <>
              <Spinner className="mr-2" />
              Signing In...
            </>
          ) : status === "redirecting" ? (
            <>
              <Spinner className="mr-2" />
              Redirecting to Dashboard...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-8 space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.18em]">
            <span className="bg-card/70 px-3 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          <SocialButton label="Continue with Google" disabled />
          <SocialButton label="Continue with Microsoft" disabled />
          <SocialButton label="Continue with Apple" disabled />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Social login can be enabled later using Supabase OAuth providers.
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary transition hover:underline"
        >
          Create Agency Account
        </Link>
      </p>

      <p className="mt-4 text-center">
        <Link
          href="/"
          className="text-xs text-muted-foreground transition hover:text-foreground"
        >
          Back to Home
        </Link>
      </p>
    </AuthCard>
  );
}

function SocialButton({
  label,
  disabled = false,
}: {
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border/70 bg-background/50 text-sm font-medium text-muted-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  );
}

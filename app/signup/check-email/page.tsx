"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Mail, MailCheck } from "lucide-react";
import { Suspense, useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function CheckEmailHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-md"
    >
      <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/80 p-10 text-center shadow-2xl backdrop-blur-xl dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-900/70">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/20"
        >
          <MailCheck className="size-10 text-emerald-300" />
        </motion.div>

        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Almost there!
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          We&apos;ve sent you a verification link. Click it to activate your
          account and start automating your agency with AI.
        </p>

        <div className="mt-6 space-y-2 text-left">
          {["Check your inbox", "Click the verification link", "Start using your dashboard"].map(
            (step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.12, duration: 0.4 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300">
                  {index + 1}
                </span>
                <span className="text-sm text-slate-300">{step}</span>
              </motion.div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    if (isResending || !email) return;

    setIsResending(true);
    setResendSuccess(null);
    setResendError(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setResendError(
          payload.message ?? "Failed to resend. Please try again."
        );
        return;
      }

      setResendSuccess(
        payload.message ?? "Verification email sent successfully."
      );
    } catch {
      setResendError(
        "Network connection lost. Please check your connection."
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthCard>
      <div className="text-center">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20"
        >
          <Mail className="size-7 text-emerald-500" />
        </motion.div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Check Your Email
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your account has been created successfully.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Please verify your email address to continue.
        </p>

        {email ? (
          <p className="mt-4 text-sm text-foreground">
            We sent a verification link to{" "}
            <span className="font-semibold">{email}</span>
          </p>
        ) : null}
      </div>

      {/* Action buttons */}
      <div className="mt-8 space-y-3">
        <a
          href={email ? `mailto:${email}` : "mailto:"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/80"
        >
          <ExternalLink className="mr-2 size-4" />
          Open Email App
        </a>

        <Button
          type="button"
          variant="outline"
          disabled={isResending || !email}
          onClick={handleResend}
          className="h-11 w-full rounded-xl text-sm"
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
      </div>

      {/* Feedback messages */}
      <AnimatePresence mode="wait">
        {resendSuccess ? (
          <motion.p
            key="resend-success"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role="status"
            className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-300"
          >
            ✓ {resendSuccess}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {resendError ? (
          <motion.div
            key="resend-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role="alert"
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            {resendError}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Help text */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Didn&apos;t receive the email? Check your spam folder or try resending.
      </p>

      {/* Navigation */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Sign In
        </Link>
        <Link
          href="/"
          className="text-xs text-muted-foreground transition hover:text-foreground"
        >
          Back to Home
        </Link>
      </div>
    </AuthCard>
  );
}

export default function CheckEmailPage() {
  return (
    <AuthShell hero={<CheckEmailHero />}>
      <Suspense>
        <CheckEmailContent />
      </Suspense>
    </AuthShell>
  );
}

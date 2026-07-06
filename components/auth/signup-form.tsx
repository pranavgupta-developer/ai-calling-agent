"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Circle,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";

import { AuthCard } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  getPasswordStrength,
  SignupFormData,
  SignupFormErrors,
  validateSignupForm,
} from "@/lib/validations/signup";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type SignupStatus = "idle" | "submitting" | "success";

const initialFormData: SignupFormData = {
  agencyName: "",
  agencyEmail: "",
  businessPhone: "",
  agencyWebsite: "",
  firstName: "",
  lastName: "",
  workEmail: "",
  mobileNumber: "",
  jobTitle: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
  agreeToPrivacy: false,
  marketingOptIn: false,
};

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function SignupForm() {
  const router = useRouter();
  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<SignupStatus>("idle");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isBusy = status === "submitting";

  const passwordStrength = getPasswordStrength(formData.password);

  // ── Helpers ──

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

  // ── Submit ──

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingRef.current) return;

    setFormError(null);

    const validationErrors = validateSignupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    isSubmittingRef.current = true;
    setStatus("submitting");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload.error === "validation" && payload.fields) {
          setErrors(payload.fields);
          setFormError(payload.message ?? "Please fix the highlighted fields.");
          setStatus("idle");
          return;
        }

        setFormError(payload.message ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      setStatus("success");

      window.setTimeout(() => {
        router.push(
          `/signup/check-email?email=${encodeURIComponent(
            formData.workEmail.trim()
          )}`
        );
      }, 600);
    } catch {
      setFormError("Network connection lost. Please check your connection.");
      setStatus("idle");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  // ── Render ──

  return (
    <AuthCard className="max-w-lg">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create Your Agency
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Start automating lead qualification, property inquiries, and client
          communication with AI.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit} noValidate>
        {/* ── Section 1: Agency Information ── */}
        <FormSection title="Agency Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="agencyName"
              label="Agency Name"
              required
              value={formData.agencyName}
              error={errors.agencyName}
              disabled={isBusy}
              placeholder="Acme Realty"
              onChange={(v) => updateField("agencyName", v)}
            />
            <Field
              id="agencyEmail"
              label="Agency Email"
              type="email"
              required
              autoComplete="email"
              value={formData.agencyEmail}
              error={errors.agencyEmail}
              disabled={isBusy}
              placeholder="info@acmerealty.com"
              onChange={(v) => updateField("agencyEmail", v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="businessPhone"
              label="Business Phone"
              type="tel"
              autoComplete="tel"
              value={formData.businessPhone}
              error={errors.businessPhone}
              disabled={isBusy}
              placeholder="+1 (555) 000-0000"
              onChange={(v) => updateField("businessPhone", v)}
            />
            <Field
              id="agencyWebsite"
              label="Agency Website"
              optional
              value={formData.agencyWebsite}
              error={errors.agencyWebsite}
              disabled={isBusy}
              placeholder="https://acmerealty.com"
              onChange={(v) => updateField("agencyWebsite", v)}
            />
          </div>
        </FormSection>

        {/* ── Section 2: Owner Information ── */}
        <FormSection title="Owner Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="firstName"
              label="First Name"
              required
              autoComplete="given-name"
              value={formData.firstName}
              error={errors.firstName}
              disabled={isBusy}
              placeholder="Jane"
              onChange={(v) => updateField("firstName", v)}
            />
            <Field
              id="lastName"
              label="Last Name"
              required
              autoComplete="family-name"
              value={formData.lastName}
              error={errors.lastName}
              disabled={isBusy}
              placeholder="Doe"
              onChange={(v) => updateField("lastName", v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="workEmail"
              label="Work Email"
              type="email"
              required
              autoComplete="email"
              value={formData.workEmail}
              error={errors.workEmail}
              disabled={isBusy}
              placeholder="jane@acmerealty.com"
              onChange={(v) => updateField("workEmail", v)}
            />
            <Field
              id="mobileNumber"
              label="Mobile Number"
              type="tel"
              required
              autoComplete="tel"
              value={formData.mobileNumber}
              error={errors.mobileNumber}
              disabled={isBusy}
              placeholder="+1 (555) 123-4567"
              onChange={(v) => updateField("mobileNumber", v)}
            />
          </div>

          <Field
            id="jobTitle"
            label="Job Title"
            optional
            value={formData.jobTitle}
            error={errors.jobTitle}
            disabled={isBusy}
            placeholder="Broker / Managing Director"
            onChange={(v) => updateField("jobTitle", v)}
          />
        </FormSection>

        {/* ── Section 3: Account Security ── */}
        <FormSection title="Account Security" icon={<Shield className="size-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <RequiredDot />
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby="password-error password-strength"
                  disabled={isBusy}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Create a strong password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((c) => !c)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password}
                </p>
              ) : null}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <RequiredDot />
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword ? "confirm-password-error" : undefined
                  }
                  disabled={isBusy}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  placeholder="Re-enter your password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((c) => !c)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p
                  id="confirm-password-error"
                  className="text-sm text-destructive"
                >
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>
          </div>

          {/* Password strength meter */}
          {formData.password.length > 0 ? (
            <motion.div
              id="password-strength"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3 overflow-hidden"
            >
              <PasswordStrengthMeter score={passwordStrength.score} />

              <ul className="grid gap-1.5 sm:grid-cols-2" role="list">
                {passwordStrength.requirements.map((req) => (
                  <motion.li
                    key={req.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    {req.met ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Circle className="size-3.5 text-muted-foreground/50" />
                    )}
                    <span
                      className={cn(
                        "transition-colors",
                        req.met
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {req.label}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </FormSection>

        {/* ── Section 4: Terms & Privacy ── */}
        <div className="space-y-3">
          <CheckboxField
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            disabled={isBusy}
            error={errors.agreeToTerms}
            onChange={(v) => updateField("agreeToTerms", v)}
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-medium text-primary transition hover:underline"
              tabIndex={-1}
            >
              Terms of Service
            </Link>
          </CheckboxField>

          <CheckboxField
            id="agreeToPrivacy"
            checked={formData.agreeToPrivacy}
            disabled={isBusy}
            error={errors.agreeToPrivacy}
            onChange={(v) => updateField("agreeToPrivacy", v)}
          >
            I agree to the{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary transition hover:underline"
              tabIndex={-1}
            >
              Privacy Policy
            </Link>
          </CheckboxField>

          <CheckboxField
            id="marketingOptIn"
            checked={formData.marketingOptIn}
            disabled={isBusy}
            onChange={(v) => updateField("marketingOptIn", v)}
          >
            Send me product updates and newsletters{" "}
            <span className="text-muted-foreground">(optional)</span>
          </CheckboxField>
        </div>

        {/* ── Error message ── */}
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

        {/* ── Success message ── */}
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
            >
              ✓ Account created successfully. Redirecting...
            </motion.p>
          ) : null}
        </AnimatePresence>

        {/* ── Submit button ── */}
        <Button
          type="submit"
          disabled={isBusy || status === "success"}
          className={cn(
            "h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/10",
            status === "success" ? "bg-emerald-600 hover:bg-emerald-600" : ""
          )}
        >
          {status === "submitting" ? (
            <>
              <Spinner className="mr-2" />
              Creating Account...
            </>
          ) : status === "success" ? (
            <>
              <Check className="mr-2 size-4" />
              Account Created
            </>
          ) : (
            "Create Agency Account"
          )}
        </Button>
      </form>

      {/* ── Social signup ── */}
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

      {/* ── Navigation links ── */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary transition hover:underline"
        >
          Sign In
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

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {title}
      </legend>
      <div className="h-px bg-border/60" />
      {children}
    </fieldset>
  );
}

function RequiredDot() {
  return (
    <span aria-hidden className="text-destructive">
      *
    </span>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
};

function Field({
  id,
  label,
  value,
  error,
  type = "text",
  required = false,
  optional = false,
  autoComplete,
  disabled,
  placeholder,
  onChange,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <RequiredDot /> : null}
        {optional ? (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        ) : null}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CheckboxField({
  id,
  checked,
  disabled,
  error,
  children,
  onChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  error?: string;
  children: React.ReactNode;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 text-sm text-foreground"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-4 rounded border-input text-primary accent-primary focus:ring-primary/30"
        />
        <span className="leading-snug">{children}</span>
      </label>
      {error ? (
        <p className="mt-1.5 pl-7 text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

// ── Password strength meter ──

const strengthColors: Record<number, string> = {
  0: "bg-destructive/60",
  1: "bg-red-500/70",
  2: "bg-orange-500/70",
  3: "bg-amber-500/70",
  4: "bg-emerald-500/70",
  5: "bg-emerald-500",
};

const strengthTextColors: Record<number, string> = {
  0: "text-destructive",
  1: "text-red-500",
  2: "text-orange-500",
  3: "text-amber-500",
  4: "text-emerald-500",
  5: "text-emerald-600 dark:text-emerald-400",
};

function PasswordStrengthMeter({ score }: { score: number }) {
  const labels: Record<number, string> = {
    0: "Very weak",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
    5: "Excellent",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Password strength</span>
        <span className={cn("text-xs font-medium", strengthTextColors[score])}>
          {labels[score]}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", strengthColors[score])}
          initial={{ width: 0 }}
          animate={{ width: `${(score / 5) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Social button ──

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

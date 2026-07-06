import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { LoginHero } from "@/components/auth/login-hero";

export const metadata: Metadata = {
  title: "Sign In | Real Estate AI",
  description:
    "Sign in to manage your agency, properties, leads, appointments, and AI calling assistant.",
};

export default function LoginPage() {
  return (
    <AuthShell hero={<LoginHero />}>
      <LoginForm />
    </AuthShell>
  );
}

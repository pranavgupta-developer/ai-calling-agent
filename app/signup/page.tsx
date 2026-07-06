import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { SignupHero } from "@/components/auth/signup-hero";

export const metadata: Metadata = {
  title: "Create Agency Account | Real Estate AI",
  description:
    "Create your agency account and start automating lead qualification, property inquiries, and client communication with AI.",
};

export default function SignupPage() {
  return (
    <AuthShell hero={<SignupHero />} wide>
      <SignupForm />
    </AuthShell>
  );
}

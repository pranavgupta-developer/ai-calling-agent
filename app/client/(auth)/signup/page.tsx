// Force HMR reload
import { Metadata } from "next";
import { SignupForm } from "@/features/client-auth/components/signup-form";

export const metadata: Metadata = {
  title: "Client Sign Up | RealAI Portal",
  description: "Create your client account to manage appointments and access personalized real estate experiences.",
};

export default function ClientSignupPage() {
  return (
    <div className="flex flex-col space-y-6">
      <SignupForm />
    </div>
  );
}

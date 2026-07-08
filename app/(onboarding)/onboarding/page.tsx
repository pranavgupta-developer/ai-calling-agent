import { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Agency Onboarding - Real Estate AI",
  description: "Complete your agency profile to get started.",
};

export default function OnboardingPage() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
      <OnboardingWizard />
    </div>
  );
}

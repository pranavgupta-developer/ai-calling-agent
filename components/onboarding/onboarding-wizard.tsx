"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { ProgressBar } from "./progress-bar";
import { BusinessInfoStep } from "./business-info-step";
import { LocationStep } from "./location-step";
import { BusinessHoursStep } from "./business-hours-step";
import { BrandingStep } from "./branding-step";
import { ReviewStep } from "./review-step";

import { createAgencyProfile, updateAgencyProfile, completeOnboarding } from "@/app/actions/agency";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { Agency } from "@/types/agency";

const STEPS = [
  { id: "business", name: "Business Info" },
  { id: "location", name: "Location" },
  { id: "hours", name: "Business Hours" },
  { id: "branding", name: "Branding" },
  { id: "review", name: "Review & Finish" },
];

export type OnboardingData = Partial<Agency>;

export function OnboardingWizard() {
  const { user, refreshSession } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingData>({
    theme_color: "#2563eb",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    business_hours: {
      monday: { isOpen: true, open: "09:00", close: "17:00" },
      tuesday: { isOpen: true, open: "09:00", close: "17:00" },
      wednesday: { isOpen: true, open: "09:00", close: "17:00" },
      thursday: { isOpen: true, open: "09:00", close: "17:00" },
      friday: { isOpen: true, open: "09:00", close: "17:00" },
      saturday: { isOpen: false, open: "09:00", close: "17:00" },
      sunday: { isOpen: false, open: "09:00", close: "17:00" },
    },
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    
    try {
      if (currentStep === 0) {
        // Step 1: Create the agency profile if we haven't already
        if (!agencyId) {
          const res = await createAgencyProfile({
            name: formData.name || "",
            email: formData.email || "",
            phone: formData.phone || "",
            website: formData.website || "",
            description: formData.description || "",
          });
          
          if (res.error) throw new Error(res.error);
          if (res.data) setAgencyId(res.data.id);
        } else {
          // Update instead
          const res = await updateAgencyProfile(agencyId, {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            website: formData.website,
            description: formData.description,
          });
          if (res.error) throw new Error(res.error);
        }
      } 
      else if (currentStep === 1 && agencyId) {
        // Step 2: Location
        const res = await updateAgencyProfile(agencyId, {
          country: formData.country,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
        });
        if (res.error) throw new Error(res.error);
      }
      else if (currentStep === 2 && agencyId) {
        // Step 3: Hours
        const res = await updateAgencyProfile(agencyId, {
          timezone: formData.timezone,
          business_hours: formData.business_hours,
        });
        if (res.error) throw new Error(res.error);
      }
      else if (currentStep === 3 && agencyId) {
        // Step 4: Branding
        const res = await updateAgencyProfile(agencyId, {
          logo_url: formData.logo_url,
          theme_color: formData.theme_color,
        });
        if (res.error) throw new Error(res.error);
      }
      else if (currentStep === 4 && agencyId) {
        // Step 5: Complete
        const res = await completeOnboarding(agencyId);
        if (res.error) throw new Error(res.error);
        
        toast.success("Setup complete! Redirecting to dashboard...");
        await refreshSession();
        router.push("/dashboard");
        return; // Don't increment step
      }

      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      toast.error(error.message || "Failed to save progress.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8 bg-white dark:bg-zinc-950 p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to Real Estate AI
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Let's get your agency configured. This information helps us set up your AI agents and client portal correctly.
        </p>
      </div>

      <ProgressBar steps={STEPS} currentStepIndex={currentStep} />

      <div className="mt-8 relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            {currentStep === 0 && (
              <BusinessInfoStep 
                data={formData} 
                updateData={updateData} 
                onNext={handleNext} 
                isSubmitting={isSubmitting} 
              />
            )}
            {currentStep === 1 && (
              <LocationStep 
                data={formData} 
                updateData={updateData} 
                onNext={handleNext} 
                onBack={handleBack} 
                isSubmitting={isSubmitting} 
              />
            )}
            {currentStep === 2 && (
              <BusinessHoursStep 
                data={formData} 
                updateData={updateData} 
                onNext={handleNext} 
                onBack={handleBack} 
                isSubmitting={isSubmitting} 
              />
            )}
            {currentStep === 3 && (
              <BrandingStep 
                data={formData} 
                updateData={updateData} 
                onNext={handleNext} 
                onBack={handleBack} 
                isSubmitting={isSubmitting}
                agencyId={agencyId}
              />
            )}
            {currentStep === 4 && (
              <ReviewStep 
                data={formData} 
                onNext={handleNext} 
                onBack={handleBack} 
                isSubmitting={isSubmitting} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

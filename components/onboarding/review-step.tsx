import { Button } from "@/components/ui/button";
import { OnboardingData } from "./onboarding-wizard";
import { CheckCircle2Icon } from "lucide-react";

type Props = {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
};

export function ReviewStep({ data, onNext, onBack, isSubmitting }: Props) {
  return (
    <div className="space-y-8 max-w-2xl text-center mx-auto">
      <div className="flex justify-center">
        <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2Icon className="h-10 w-10 text-green-600 dark:text-green-500" />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold leading-6 text-gray-900 dark:text-white">You're all set!</h3>
        <p className="mt-4 text-gray-500 max-w-lg mx-auto">
          Thanks for setting up <strong>{data.name}</strong>. You can always change these settings later in your agency dashboard.
        </p>
      </div>
      
      <div className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 text-left max-w-md mx-auto space-y-4">
        <div>
          <span className="text-sm font-medium text-gray-500">Agency Name</span>
          <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Business Email</span>
          <p className="font-semibold text-gray-900 dark:text-white">{data.email}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Location</span>
          <p className="font-semibold text-gray-900 dark:text-white">{data.city ? `${data.city}, ${data.country}` : data.country}</p>
        </div>
      </div>

      <div className="flex justify-between pt-6 mt-8 max-w-md mx-auto">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onNext} disabled={isSubmitting} className="px-8">
          {isSubmitting ? "Finishing..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
}

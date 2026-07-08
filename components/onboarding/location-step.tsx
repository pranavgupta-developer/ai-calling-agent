import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./onboarding-wizard";
import { MapPinIcon } from "lucide-react";

type Props = {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
};

export function LocationStep({ data, updateData, onNext, onBack, isSubmitting }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};
    if (!data.country?.trim()) newErrors.country = "Country is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-6 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Location</h3>
          <p className="mt-1 text-sm text-gray-500">Where is your agency located?</p>
        </div>

        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Country *
            </label>
            <div className="mt-1">
              <select
                id="country"
                name="country"
                value={data.country || ""}
                onChange={(e) => updateData({ country: e.target.value })}
                className={`block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.country ? "border-red-500" : ""
                }`}
              >
                <option value="">Select a country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                {/* Add more as needed */}
              </select>
              {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address Line 1
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="address_line_1"
                id="address_line_1"
                value={data.address_line_1 || ""}
                onChange={(e) => updateData({ address_line_1: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address Line 2 (Optional)
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="address_line_2"
                id="address_line_2"
                value={data.address_line_2 || ""}
                onChange={(e) => updateData({ address_line_2: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="city"
                id="city"
                value={data.city || ""}
                onChange={(e) => updateData({ city: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              State / Province
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="state"
                id="state"
                value={data.state || ""}
                onChange={(e) => updateData({ state: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Postal code
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="postal_code"
                id="postal_code"
                value={data.postal_code || ""}
                onChange={(e) => updateData({ postal_code: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button onClick={validateAndNext} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>
      
      {/* Map Placeholder */}
      <div className="hidden md:block">
        <div className="h-full min-h-[400px] rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-gray-400">
          <MapPinIcon className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-sm font-medium">Google Maps Preview Placeholder</p>
          {data.city && <p className="mt-2 text-xs text-gray-500">{data.city}, {data.country}</p>}
        </div>
      </div>
    </div>
  );
}

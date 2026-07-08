import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./onboarding-wizard";

type Props = {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isSubmitting: boolean;
};

export function BusinessInfoStep({ data, updateData, onNext, isSubmitting }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};
    if (!data.name?.trim()) newErrors.name = "Agency Name is required";
    if (!data.email?.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(data.email)) newErrors.email = "Invalid email format";
    if (!data.phone?.trim()) newErrors.phone = "Phone Number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Business Details</h3>
        <p className="mt-1 text-sm text-gray-500">Provide the basic information about your agency.</p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Agency Name *
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={data.name || ""}
              onChange={(e) => updateData({ name: e.target.value })}
              className={`block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Business Email *
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              value={data.email || ""}
              onChange={(e) => updateData({ email: e.target.value })}
              className={`block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number *
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={data.phone || ""}
              onChange={(e) => updateData({ phone: e.target.value })}
              className={`block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.phone ? "border-red-500" : ""
              }`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Website (Optional)
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="website"
              id="website"
              value={data.website || ""}
              onChange={(e) => updateData({ website: e.target.value })}
              className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Business Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={4}
              value={data.description || ""}
              onChange={(e) => updateData({ description: e.target.value })}
              className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Tell us a little about your agency..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button onClick={validateAndNext} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}

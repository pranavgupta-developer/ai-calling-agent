import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./onboarding-wizard";
import { DayOperatingHours, OperatingHours } from "@/types/agency";

type Props = {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
};

const DAYS: (keyof OperatingHours)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function BusinessHoursStep({ data, updateData, onNext, onBack, isSubmitting }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};
    if (!data.timezone) newErrors.timezone = "Timezone is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  const updateDay = (day: keyof OperatingHours, value: Partial<DayOperatingHours>) => {
    if (!data.business_hours) return;
    updateData({
      business_hours: {
        ...data.business_hours,
        [day]: { ...data.business_hours[day], ...value },
      },
    });
  };

  const copyMondayToAll = () => {
    if (!data.business_hours) return;
    const monday = data.business_hours.monday;
    updateData({
      business_hours: {
        monday,
        tuesday: { ...monday },
        wednesday: { ...monday },
        thursday: { ...monday },
        friday: { ...monday },
        saturday: { ...monday },
        sunday: { ...monday },
      },
    });
  };

  const set24Hours = () => {
    if (!data.business_hours) return;
    const newHours: any = {};
    for (const day of DAYS) {
      newHours[day] = { isOpen: true, open: "00:00", close: "23:59" };
    }
    updateData({ business_hours: newHours });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Business Hours</h3>
        <p className="mt-1 text-sm text-gray-500">When is your agency open for business?</p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div className="sm:col-span-2">
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Timezone *
          </label>
          <div className="mt-1 flex gap-4 items-center">
            <select
              id="timezone"
              name="timezone"
              value={data.timezone || ""}
              onChange={(e) => updateData({ timezone: e.target.value })}
              className={`block w-full max-w-xs rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.timezone ? "border-red-500" : ""
              }`}
            >
              <option value="">Select a timezone</option>
              {Intl.supportedValuesOf("timeZone").map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone}</p>}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Weekly Schedule</h4>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyMondayToAll}>
              Copy Monday to All
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={set24Hours}>
              24/7
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {data.business_hours &&
            DAYS.map((day) => {
              const dayConfig = data.business_hours![day];
              return (
                <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                  <div className="w-32 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={dayConfig.isOpen}
                      onChange={(e) => updateDay(day, { isOpen: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">{day}</span>
                  </div>

                  {dayConfig.isOpen ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={dayConfig.open}
                        onChange={(e) => updateDay(day, { open: e.target.value })}
                        className="block w-32 rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-950 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <span className="text-gray-500 text-sm">to</span>
                      <input
                        type="time"
                        value={dayConfig.close}
                        onChange={(e) => updateDay(day, { close: e.target.value })}
                        className="block w-32 rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-950 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Closed</div>
                  )}
                </div>
              );
            })}
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
  );
}

"use client";

import { useState } from "react";
import { Agency, OperatingHours, DayOperatingHours } from "@/types/agency";
import { updateAgencyProfile } from "@/app/actions/agency";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  agency: Agency;
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

const DEFAULT_HOURS: OperatingHours = {
  monday: { isOpen: true, open: "09:00", close: "17:00" },
  tuesday: { isOpen: true, open: "09:00", close: "17:00" },
  wednesday: { isOpen: true, open: "09:00", close: "17:00" },
  thursday: { isOpen: true, open: "09:00", close: "17:00" },
  friday: { isOpen: true, open: "09:00", close: "17:00" },
  saturday: { isOpen: false, open: "09:00", close: "17:00" },
  sunday: { isOpen: false, open: "09:00", close: "17:00" },
};

export function BusinessHoursForm({ agency }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timezone, setTimezone] = useState(
    agency.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [hours, setHours] = useState<OperatingHours>(
    agency.business_hours || DEFAULT_HOURS
  );

  const updateDay = (day: keyof OperatingHours, value: Partial<DayOperatingHours>) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...value },
    }));
  };

  const copyMondayToAll = () => {
    const monday = hours.monday;
    setHours({
      monday,
      tuesday: { ...monday },
      wednesday: { ...monday },
      thursday: { ...monday },
      friday: { ...monday },
      saturday: { ...monday },
      sunday: { ...monday },
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await updateAgencyProfile(agency.id, {
        timezone,
        business_hours: hours,
      });
      if (error) throw new Error(error);
      toast.success("Business hours saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Business Hours</h3>
        <p className="mt-1 text-sm text-gray-500">Manage when your agency is open.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border-gray-300 dark:border-gray-700 dark:bg-zinc-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {Intl.supportedValuesOf("timeZone").map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Weekly Schedule</h4>
          <Button type="button" variant="outline" size="sm" onClick={copyMondayToAll}>
            Copy Monday to All
          </Button>
        </div>

        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayConfig = hours[day];
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

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

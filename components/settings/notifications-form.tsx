"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NotificationsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    appointments: true,
    leads: true,
    calls: true,
    marketing: false,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    toast.success("Notification preferences saved successfully.");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
        <p className="mt-1 text-sm text-gray-500">Manage how and when you want to be notified.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive general system alerts via email.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.email}
            onChange={() => handleToggle("email")}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Appointment Notifications</h4>
            <p className="text-sm text-gray-500">Get notified when a new appointment is booked or changed.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.appointments}
            onChange={() => handleToggle("appointments")}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Lead Notifications</h4>
            <p className="text-sm text-gray-500">Alert me when a new lead is captured by the AI.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.leads}
            onChange={() => handleToggle("leads")}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Call Notifications</h4>
            <p className="text-sm text-gray-500">Summaries of completed AI calls.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.calls}
            onChange={() => handleToggle("calls")}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Marketing Emails</h4>
            <p className="text-sm text-gray-500">Receive news, updates, and promotional content.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.marketing}
            onChange={() => handleToggle("marketing")}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}

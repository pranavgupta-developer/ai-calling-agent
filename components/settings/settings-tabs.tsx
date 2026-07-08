"use client";

import { useState } from "react";
import { Agency } from "@/types/agency";
import { BusinessProfileForm } from "./business-profile-form";
import { BusinessHoursForm } from "./business-hours-form";
import { BrandingForm } from "./branding-form";
import { NotificationsForm } from "./notifications-form";

type Props = {
  agency: Agency;
};

const TABS = [
  { id: "general", name: "General" },
  { id: "location", name: "Location" },
  { id: "hours", name: "Business Hours" },
  { id: "branding", name: "Branding" },
  { id: "notifications", name: "Notifications" },
];

export function SettingsTabs({ agency }: Props) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300"
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-4">
        {activeTab === "general" && <BusinessProfileForm agency={agency} mode="general" />}
        {activeTab === "location" && <BusinessProfileForm agency={agency} mode="location" />}
        {activeTab === "hours" && <BusinessHoursForm agency={agency} />}
        {activeTab === "branding" && <BrandingForm agency={agency} />}
        {activeTab === "notifications" && <NotificationsForm />}
      </div>
    </div>
  );
}

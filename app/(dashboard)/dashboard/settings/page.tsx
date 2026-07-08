"use client";

import { useAuth } from "@/providers/auth-provider";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default function SettingsPage() {
  const { agency } = useAuth();

  if (!agency) {
    return (
      <div className="p-8">
        <div className="animate-pulse h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-8"></div>
        <div className="animate-pulse h-64 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your agency profile, branding, and preferences.</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <SettingsTabs agency={agency as any} />
      </div>
    </div>
  );
}

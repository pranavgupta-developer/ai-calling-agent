"use client";

import { useState } from "react";
import { Agency } from "@/types/agency";
import { updateAgencyProfile } from "@/app/actions/agency";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uploadAgencyLogo } from "@/lib/supabase/storage";
import { ImageIcon } from "lucide-react";

type Props = {
  agency: Agency;
};

const THEME_COLORS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#9333ea" },
  { name: "Pink", value: "#db2777" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Yellow", value: "#ca8a04" },
  { name: "Green", value: "#16a34a" },
  { name: "Teal", value: "#0d9488" },
  { name: "Slate", value: "#475569" },
  { name: "Black", value: "#000000" },
];

export function BrandingForm({ agency }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [themeColor, setThemeColor] = useState(agency.theme_color || "#2563eb");
  const [logoUrl, setLogoUrl] = useState(agency.logo_url);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    
    setIsUploading(true);
    const supabase = createClient();
    
    try {
      const { url, error } = await uploadAgencyLogo(supabase, agency.id, file);
      if (error) throw new Error(error);
      
      if (url) {
        setLogoUrl(url);
        toast.success("Logo uploaded successfully. Make sure to save changes.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await updateAgencyProfile(agency.id, {
        theme_color: themeColor,
        logo_url: logoUrl,
      });
      if (error) throw new Error(error);
      toast.success("Branding settings saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Branding</h3>
        <p className="mt-1 text-sm text-gray-500">Customize the look and feel of your agency portal.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agency Logo</label>
          <div className="mt-2 flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg bg-gray-100 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-shrink-0 items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Agency logo" className="h-full w-full object-contain bg-white" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                id="settings-logo-upload"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label htmlFor="settings-logo-upload">
                <Button type="button" variant="outline" disabled={isUploading} onClick={() => document.getElementById('settings-logo-upload')?.click()}>
                  {isUploading ? "Uploading..." : "Upload Logo"}
                </Button>
              </label>
              <p className="mt-2 text-xs text-gray-500">PNG, JPG, WEBP up to 5MB.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme Color</label>
          <div className="mt-4 grid grid-cols-5 gap-4 sm:grid-cols-10">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`w-8 h-8 rounded-full ring-offset-2 transition-all ${
                  themeColor === color.value ? "ring-2 ring-gray-400 scale-110" : "hover:scale-110"
                } dark:ring-offset-zinc-950`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                onClick={() => setThemeColor(color.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

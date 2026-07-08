import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./onboarding-wizard";
import { createClient } from "@/lib/supabase/client";
import { uploadAgencyLogo } from "@/lib/supabase/storage";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";

type Props = {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  agencyId: string | null;
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

export function BrandingStep({ data, updateData, onNext, onBack, isSubmitting, agencyId }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !agencyId) return;
    
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    
    setIsUploading(true);
    const supabase = createClient();
    
    try {
      const { url, error } = await uploadAgencyLogo(supabase, agencyId, file);
      if (error) throw new Error(error);
      
      if (url) {
        updateData({ logo_url: url });
        toast.success("Logo uploaded successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Branding</h3>
        <p className="mt-1 text-sm text-gray-500">Personalize your agency's appearance.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Agency Logo
          </label>
          <div className="mt-2 flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg bg-gray-100 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-shrink-0 items-center justify-center overflow-hidden">
              {data.logo_url ? (
                <img src={data.logo_url} alt="Agency logo" className="h-full w-full object-contain bg-white" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                id="logo-upload"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading || !agencyId}
              />
              <label htmlFor="logo-upload">
                <Button type="button" variant="outline" disabled={isUploading || !agencyId} onClick={() => document.getElementById('logo-upload')?.click()}>
                  {isUploading ? "Uploading..." : "Upload Logo"}
                </Button>
              </label>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, WEBP up to 5MB.
              </p>
              {!agencyId && (
                <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
                  Please complete the Business Info step first to upload a logo.
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme Color
          </label>
          <div className="mt-4 grid grid-cols-5 gap-4 sm:grid-cols-10">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`w-8 h-8 rounded-full ring-offset-2 transition-all ${
                  data.theme_color === color.value ? "ring-2 ring-gray-400 scale-110" : "hover:scale-110"
                } dark:ring-offset-zinc-950`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                onClick={() => updateData({ theme_color: color.value })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting || isUploading}>
          Back
        </Button>
        <Button onClick={onNext} disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}

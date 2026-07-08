import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadAgencyLogo(
  supabase: SupabaseClient,
  agencyId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${agencyId}/logo/${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from("agency-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { error: "Failed to upload logo." };
    }

    // Get public URL
    const { data } = supabase.storage
      .from("agency-assets")
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (error) {
    console.error("Unexpected error in uploadAgencyLogo:", error);
    return { error: "An unexpected error occurred during upload." };
  }
}

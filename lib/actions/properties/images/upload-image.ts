"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_IMAGES_PER_LISTING = 10;

export async function uploadPropertyImage(propertyId: string, formData: FormData) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const userId = authData.user.id;

    // 2. Validate property existence & ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, agency_id")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return { error: "Property not found." };
    }

    const agencyId = property.agency_id;

    // 3. Get file from formData
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided." };
    }

    // 4. Validate file type and size
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: "Invalid file type. Only JPG, PNG, and WEBP are allowed." };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { error: "File size exceeds the 5MB limit." };
    }

    // 5. Check max images limit
    const { count, error: countError } = await supabase
      .from("property_images")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId);

    if (countError) {
      return { error: "Failed to check existing images count." };
    }

    if ((count || 0) >= MAX_IMAGES_PER_LISTING) {
      return { error: `Maximum of ${MAX_IMAGES_PER_LISTING} images allowed per listing.` };
    }

    // 6. Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    // Structure: {agency_id}/{property_id}/{fileName}
    const storagePath = `${agencyId}/${propertyId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { error: "Failed to upload image to storage." };
    }

    // 7. Determine display_order
    const { data: lastImage } = await supabase
      .from("property_images")
      .select("display_order")
      .eq("property_id", propertyId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const displayOrder = lastImage ? lastImage.display_order + 1 : 0;

    // 8. Insert record into property_images
    const { data: imageRecord, error: insertError } = await supabase
      .from("property_images")
      .insert({
        agency_id: agencyId,
        property_id: propertyId,
        storage_path: storagePath,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (insertError) {
      // Rollback storage upload if DB insert fails
      await supabase.storage.from("listing-images").remove([storagePath]);
      console.error("DB insert error:", insertError);
      return { error: "Failed to save image metadata." };
    }

    // Get public URL or signed URL if private.
    // Given the prompt "Agency A cannot view Agency B images", we'll generate signed urls when fetching.
    
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    return { success: true, data: imageRecord };
  } catch (error) {
    console.error("Upload property image error:", error);
    return { error: "An unexpected error occurred." };
  }
}

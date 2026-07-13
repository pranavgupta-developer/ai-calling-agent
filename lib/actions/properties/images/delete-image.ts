"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePropertyImage(imageId: string) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    // 2. Fetch the image to get storage_path and property_id
    const { data: image, error: fetchError } = await supabase
      .from("property_images")
      .select("id, storage_path, property_id, display_order")
      .eq("id", imageId)
      .single();

    if (fetchError || !image) {
      return { error: "Image not found." };
    }

    // 3. Delete from storage
    const { error: storageError } = await supabase.storage
      .from("listing-images")
      .remove([image.storage_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      return { error: "Failed to delete image file from storage." };
    }

    // 4. Delete from database
    const { error: deleteError } = await supabase
      .from("property_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      console.error("DB delete error:", deleteError);
      return { error: "Failed to remove image metadata." };
    }

    // 5. Reorder remaining images to close any gaps
    const { data: remainingImages, error: getRemainingError } = await supabase
      .from("property_images")
      .select("id")
      .eq("property_id", image.property_id)
      .order("display_order", { ascending: true });

    if (!getRemainingError && remainingImages) {
      for (let i = 0; i < remainingImages.length; i++) {
        await supabase
          .from("property_images")
          .update({ display_order: i })
          .eq("id", remainingImages[i].id);
      }
    }

    revalidatePath(`/dashboard/properties/${image.property_id}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Delete property image error:", error);
    return { error: "An unexpected error occurred." };
  }
}

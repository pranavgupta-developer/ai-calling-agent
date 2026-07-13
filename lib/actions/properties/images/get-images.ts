"use server";

import { createClient } from "@/lib/supabase/server";

export type PropertyImage = {
  id: string;
  property_id: string;
  storage_path: string;
  display_order: number;
  url: string; // The signed URL
};

export async function getPropertyImages(propertyId: string): Promise<{ data?: PropertyImage[], error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Fetch images from DB
    const { data: images, error } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Get images error:", error);
      return { error: "Failed to fetch images." };
    }

    if (!images || images.length === 0) {
      return { data: [] };
    }

    // 2. Generate signed URLs for each image (since bucket is private)
    // 60 minutes expiry is usually enough for a session
    const EXPIRES_IN = 60 * 60; 
    
    // Create an array of paths
    const paths = images.map((img) => img.storage_path);
    
    const { data: signedUrls, error: signError } = await supabase.storage
      .from("listing-images")
      .createSignedUrls(paths, EXPIRES_IN);

    if (signError || !signedUrls) {
      console.error("Signed URLs error:", signError);
      return { error: "Failed to generate image URLs." };
    }

    // Map the URLs back to the image objects
    const imagesWithUrls = images.map((img, index) => ({
      ...img,
      url: signedUrls[index]?.signedUrl || "",
    }));

    return { data: imagesWithUrls };
  } catch (error) {
    console.error("Get property images exception:", error);
    return { error: "An unexpected error occurred." };
  }
}

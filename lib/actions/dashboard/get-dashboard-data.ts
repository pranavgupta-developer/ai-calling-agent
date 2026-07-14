"use server";

import { createClient } from "@/lib/supabase/server";
import { Property } from "@/types/property";

export async function getDashboardData() {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    // Run all aggregate count queries concurrently
    const [
      { count: totalCount },
      { count: availableCount },
      { count: pendingCount },
      { count: soldCount },
      { count: featuredCount },
      { count: activeCount },
      { count: inactiveCount },
      { data: recentListings, error: recentListingsError },
    ] = await Promise.all([
      // Total Listings
      supabase.from("properties").select("*", { count: "exact", head: true }),
      // Available Listings
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("status", "available"),
      // Pending Listings
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      // Sold Listings
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("status", "sold"),
      // Featured Listings
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("is_featured", true),
      // Active Listings
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      // Inactive Listings
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("is_active", false),
      // Recent 5 Listings
      supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (recentListingsError) {
      console.error(
        "Error fetching recent listings:",
        recentListingsError.message
      );
      return { error: "Failed to load dashboard data." };
    }

    const properties = (recentListings || []) as any[];
    const pathsToSign: string[] = [];
    const propertyToPathMap = new Map<string, string>();

    // Fetch cover images for the recent listings
    const propertyIds = properties.map((p) => p.id);
    if (propertyIds.length > 0) {
      const { data: imagesData } = await supabase
        .from("property_images")
        .select("property_id, storage_path, display_order")
        .in("property_id", propertyIds)
        .order("display_order", { ascending: true });

      if (imagesData) {
        imagesData.forEach((img) => {
          if (!propertyToPathMap.has(img.property_id)) {
            pathsToSign.push(img.storage_path);
            propertyToPathMap.set(img.property_id, img.storage_path);
          }
        });
      }
    }

    let signedUrlsMap = new Map<string, string>();
    if (pathsToSign.length > 0) {
      const { data: signedUrls, error: signError } = await supabase.storage
        .from("listing-images")
        .createSignedUrls(pathsToSign, 60 * 60);

      if (!signError && signedUrls) {
        signedUrls.forEach((su, index) => {
          if (su.signedUrl) {
            signedUrlsMap.set(pathsToSign[index], su.signedUrl);
          }
        });
      }
    }

    const finalRecentListings: Property[] = properties.map((prop) => {
      const path = propertyToPathMap.get(prop.id);
      return {
        ...prop,
        cover_image_url: path ? signedUrlsMap.get(path) : undefined,
      };
    });

    return {
      stats: {
        total: totalCount || 0,
        available: availableCount || 0,
        pending: pendingCount || 0,
        sold: soldCount || 0,
        featured: featuredCount || 0,
        active: activeCount || 0,
        inactive: inactiveCount || 0,
      },
      recentListings: finalRecentListings,
    };
  } catch (error) {
    console.error("Get dashboard data error:", error);
    return { error: "An unexpected error occurred." };
  }
}

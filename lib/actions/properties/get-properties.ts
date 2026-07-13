"use server";

import { createClient } from "@/lib/supabase/server";
import { Property } from "@/types/property";

export interface GetPropertiesParams {
  page?: number;
  query?: string;
  type?: string;
  status?: string;
  price?: string;
}

const ITEMS_PER_PAGE = 10;

export async function getProperties({
  page = 1,
  query,
  type,
  status,
  price,
}: GetPropertiesParams) {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    let dbQuery = supabase
      .from("properties")
      .select("*", { count: "exact" });

    // Text search on title or description
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (type && type !== "All") {
      dbQuery = dbQuery.eq("property_type", type.toLowerCase());
    }

    if (status && status !== "All") {
      dbQuery = dbQuery.eq("status", status.toLowerCase());
    }

    if (price && price !== "All") {
      if (price === "0-10L") {
        dbQuery = dbQuery.lte("price", 1000000);
      } else if (price === "10L-50L") {
        dbQuery = dbQuery.gte("price", 1000000).lte("price", 5000000);
      } else if (price === "50L+") {
        dbQuery = dbQuery.gte("price", 5000000);
      }
    }

    // Pagination
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    dbQuery = dbQuery
      .order("created_at", { ascending: false })
      .range(from, to);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error("Error fetching properties:", error?.message || JSON.stringify(error));
      return { error: `Failed to load properties: ${error?.message || 'Unknown error'}` };
    }

    const properties = data as any[];
    const pathsToSign: string[] = [];
    const propertyToPathMap = new Map<string, string>();

    // Fetch images separately to avoid schema cache relation errors
    const propertyIds = properties.map(p => p.id);
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
        .createSignedUrls(pathsToSign, 60 * 60); // 1 hour expiry
        
      if (!signError && signedUrls) {
        signedUrls.forEach((su, index) => {
          if (su.signedUrl) {
            signedUrlsMap.set(pathsToSign[index], su.signedUrl);
          }
        });
      }
    }

    const finalData: Property[] = properties.map((prop) => {
      const path = propertyToPathMap.get(prop.id);
      return {
        ...prop,
        cover_image_url: path ? signedUrlsMap.get(path) : undefined,
      };
    });

    return {
      data: finalData,
      count: count || 0,
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
    };
  } catch (error) {
    console.error("Get properties error:", error);
    return { error: "An unexpected error occurred." };
  }
}

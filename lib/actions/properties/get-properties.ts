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
      console.error("Error fetching properties:", error);
      return { error: "Failed to load properties." };
    }

    return {
      data: data as Property[],
      count: count || 0,
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
    };
  } catch (error) {
    console.error("Get properties error:", error);
    return { error: "An unexpected error occurred." };
  }
}

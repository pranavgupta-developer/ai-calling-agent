import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { resolveAgencyId } from "@/lib/auth/agency";
import { KnowledgeBaseService } from "@/lib/services/knowledge-base";
import { z } from "zod";

const simpleSearchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
});

export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agencyId = await resolveAgencyId(supabase, user.id);
    if (!agencyId) {
      return NextResponse.json({ error: "Forbidden: No agency associated" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = { q: searchParams.get("q") || "" };

    const validatedQuery = simpleSearchSchema.parse(query);

    // Reuse the search service with a high limit for top matches
    const result = await KnowledgeBaseService.search(agencyId, {
      q: validatedQuery.q,
      limit: 10,
      status: "active",
      page: 1,
      sort: "display_order"
    });

    return NextResponse.json({ results: result.data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

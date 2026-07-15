import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { resolveAgencyId } from "@/lib/auth/agency";
import { KnowledgeBaseService } from "@/lib/services/knowledge-base";
import { createKnowledgeBaseSchema, searchKnowledgeBaseSchema } from "@/lib/validations/knowledge-base";
import { z } from "zod";

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
    const query = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page") as string, 10) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit") as string, 10) : undefined,
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      sort: searchParams.get("sort") || undefined,
    };

    const validatedQuery = searchKnowledgeBaseSchema.parse(query);
    const result = await KnowledgeBaseService.search(agencyId, validatedQuery);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const validatedData = createKnowledgeBaseSchema.parse(body);

    const newEntry = await KnowledgeBaseService.create(agencyId, validatedData);

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    
    if (errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint")) {
      return NextResponse.json({ error: "Duplicate Entry" }, { status: 409 });
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

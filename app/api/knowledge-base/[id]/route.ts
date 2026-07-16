import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { resolveAgencyId } from "@/lib/auth/agency";
import { KnowledgeBaseService } from "@/lib/services/knowledge-base";
import { knowledgeBaseSchema } from "@/lib/validations/knowledge-base";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
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

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    const entry = await KnowledgeBaseService.getById(agencyId, id);
    if (!entry) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
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

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    // Verify it exists first
    const existing = await KnowledgeBaseService.getById(agencyId, id);
    if (!existing) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = knowledgeBaseSchema.partial().parse(body);

    const updatedEntry = await KnowledgeBaseService.update(agencyId, id, validatedData);

    return NextResponse.json(updatedEntry);
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

export async function DELETE(request: Request, context: RouteContext) {
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

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    // Verify it exists first
    const existing = await KnowledgeBaseService.getById(agencyId, id);
    if (!existing) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    await KnowledgeBaseService.softDelete(agencyId, id);

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

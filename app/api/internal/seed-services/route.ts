import { NextResponse } from "next/server";
import { seedDefaultServices } from "@/lib/actions/services/seed-services";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agencyId } = body;

    if (!agencyId || typeof agencyId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid agencyId in request body" },
        { status: 400 }
      );
    }

    const result = await seedDefaultServices(agencyId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("[POST /api/internal/seed-services] Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request payload or internal error" },
      { status: 500 }
    );
  }
}

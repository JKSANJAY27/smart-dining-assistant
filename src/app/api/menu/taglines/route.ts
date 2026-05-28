import { NextResponse } from "next/server";
import { getAllMenuItems } from "@/lib/db/menu";
import { getBulkTaglines } from "@/lib/aiTaglines";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getAllMenuItems();
    const taglines = await getBulkTaglines(items);

    return NextResponse.json({
      success: true,
      data: taglines,
    });
  } catch (error) {
    console.error("[Taglines API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch taglines" },
      { status: 500 }
    );
  }
}

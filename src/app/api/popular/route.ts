import { NextRequest, NextResponse } from "next/server";
import { getPopularItems } from "@/lib/db/menu";
import { getTimeOfDay } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "5");
  const time = req.nextUrl.searchParams.get("time") || getTimeOfDay();

  try {
    const items = await getPopularItems(Math.min(limit, 10));
    return NextResponse.json({
      success: true,
      data: items,
      timeOfDay: time,
      total: items.length,
    });
  } catch (error) {
    console.error("[Popular API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch popular items" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { searchMenuItems } from "@/lib/db/menu";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ success: true, data: [], total: 0 });
  }

  try {
    const items = await searchMenuItems(q);
    return NextResponse.json({ success: true, data: items, total: items.length });
  } catch (error) {
    console.error("[Menu Search API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}

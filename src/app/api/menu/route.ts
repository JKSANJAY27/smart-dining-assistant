import { NextResponse } from "next/server";
import { getAllMenuItems, getMenuCategories } from "@/lib/db/menu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [items, categories] = await Promise.all([
      getAllMenuItems(),
      getMenuCategories(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        categories,
        total: items.length,
      },
    });
  } catch (error) {
    console.error("[Menu API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

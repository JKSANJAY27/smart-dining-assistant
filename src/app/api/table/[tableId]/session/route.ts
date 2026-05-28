import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/db/session";
import { setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params;
    
    if (!tableId) {
      return NextResponse.json(
        { success: false, error: "Table ID is required" },
        { status: 400 }
      );
    }

    // Retrieve active session or create a new one
    const session = await getOrCreateSession(tableId);

    // Set the HTTP-only cookie with signed session token
    await setSessionCookie(session.id, tableId);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        tableId: session.tableId,
        status: session.status,
        expiresAt: session.expiresAt,
        guestCount: session.guestCount,
      },
    });
  } catch (error) {
    console.error("[Session API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize table session" },
      { status: 500 }
    );
  }
}

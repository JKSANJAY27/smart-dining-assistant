import { NextRequest, NextResponse } from "next/server";
import { getSessionById, getRecentMessages } from "@/lib/db/session";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    
    // Verify session validity
    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Active dining session not found." },
        { status: 404 }
      );
    }

    // Load recent messages (reverse order since database query takes newest first)
    const messages = await getRecentMessages(sessionId, 40);
    const sortedMessages = [...messages].reverse();

    return NextResponse.json({ messages: sortedMessages });
  } catch (error: any) {
    console.error("❌ Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to retrieve conversation history." },
      { status: 500 }
    );
  }
}

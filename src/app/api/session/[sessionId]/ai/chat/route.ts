import { NextRequest, NextResponse } from "next/server";
import { orchestrateConversation, getInitialGreeting } from "@/lib/ai/agents/orchestrator";
import { getSessionById } from "@/lib/db/session";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
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

    const body = await req.json().catch(() => ({}));
    const { message, init } = body;

    // Handle initial greeting invocation
    if (init || !message || message.trim() === "") {
      const greetingResult = await getInitialGreeting(sessionId);
      return NextResponse.json(greetingResult);
    }

    // Process the conversation through the multi-agent orchestrator
    const result = await orchestrateConversation(sessionId, message);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ Error in AI chat route:", error);
    return NextResponse.json(
      { 
        error: "Something went wrong in the Zara dining assistant pipeline.",
        details: error?.message || error
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSessionById, saveMessage } from "@/lib/db/session";
import { getPreferences } from "@/lib/ai/agents/contextMemoryAgent";
import { runGreeterOrOnboarding } from "@/lib/ai/agents/greeterAgent";
import { normalizeInput } from "@/lib/ai/agents/multilingualAgent";
import { getRecommendations } from "@/lib/ai/agents/recommendationAgent";
import { checkGroupCartConflicts } from "@/lib/ai/agents/groupCoordinatorAgent";
import { getContextualUpsell } from "@/lib/ai/agents/upsellAgent";
import { getLLM } from "@/lib/ai/gemini";
import { searchSemanticMenu } from "@/lib/ai/vectorStore";
import type { MenuItem } from "@prisma/client";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;

    // 1. Verify session validity
    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Active dining session not found." },
        { status: 404 }
      );
    }

    const { message } = await req.json().catch(() => ({}));
    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    const trimmedMsg = message.trim();

    // 2. Load preferences
    const preferences = await getPreferences(sessionId);

    // ─── Case A: Onboarding is NOT complete ───────────────────────────────
    // Onboarding responses are fast state-machine steps; we can return them as a single SSE event
    if (preferences.onboardingCompleted !== true) {
      await saveMessage(sessionId, "USER", trimmedMsg);
      const onboardingResult = await runGreeterOrOnboarding(sessionId, trimmedMsg);
      await saveMessage(sessionId, "ASSISTANT", onboardingResult.speech, {
        onboardingCompleted: false,
        step: onboardingResult.nextStep,
      });

      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        start(controller) {
          // Emit text chunk
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: onboardingResult.speech })}\n\n`)
          );
          // Emit metadata chunk
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                metadata: {
                  onboardingCompleted: false,
                  recommendedItems: [],
                  intent: "onboarding",
                },
              })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ─── Case B: Onboarding is complete, run Gemini Stream ─────────────────
    // Save user's message first
    await saveMessage(sessionId, "USER", trimmedMsg);

    // Run NLU and sentiment analysis
    const nluResult = await normalizeInput(trimmedMsg);
    const conflicts = await checkGroupCartConflicts(sessionId);
    const userAllergens = preferences.allergens || [];
    
    // Perform semantic search
    const vectorMatches = await searchSemanticMenu(nluResult.normalizedQuery, 9);
    
    // Safe allergy filtering
    const finalRecommendations = vectorMatches
      .map((m) => m.menuItem)
      .filter((item) => {
        // Allergy check (critical safety)
        const itemAllergens = (item.allergens || []).map((a) => a.toLowerCase().trim());
        for (const ua of userAllergens.map((a) => a.toLowerCase().trim())) {
          if (itemAllergens.some((ia) => ia.includes(ua) || ua.includes(ia))) return false;
        }
        return true;
      })
      .slice(0, 3);

    // Call Gemini to generate a streaming Sommelier response
    const dishDescriptions = finalRecommendations
      .map((item) => `- **${item.name}**: ${item.description}`)
      .join("\n");

    const systemPrompt = `
You are "Zara", a world-class head chef and sommelier at the premium restaurant "Spice Garden".
Write a short, sophisticated, and appetizing response (max 3 sentences) presenting these options.
Explain briefly WHY these dishes fit their search for "${nluResult.normalizedQuery}". Keep it mouth-watering, premium, and welcoming! Do not print prices.

Recommendations:
${dishDescriptions}
    `;

    const model = getLLM("gemini-2.0-flash-exp", 0.7);
    const geminiStream = await model.generateContentStream(systemPrompt);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullSpeech = "";

        try {
          // Stream chunks from Gemini live
          for await (const chunk of geminiStream.stream) {
            const chunkText = chunk.text();
            fullSpeech += chunkText;
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`)
            );
          }

          // Generate upsell and safety notifications to append at the end
          let safetySuffix = "";
          let upsellSuffix = "";
          const extraRecommended: MenuItem[] = [...finalRecommendations];

          if (conflicts.conflictDetected) {
            safetySuffix = `\n\n⚠️ **Table Allergy Warning:** ${conflicts.warningMessage}`;
            fullSpeech += safetySuffix;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: safetySuffix })}\n\n`)
            );
          } else {
            // Check for contextual upsells
            const upsell = await getContextualUpsell(sessionId);
            if (upsell && upsell.suggestedItem) {
              upsellSuffix = `\n\n✨ **Sommelier's Suggestion:** ${upsell.upsellCopy}`;
              fullSpeech += upsellSuffix;
              extraRecommended.push(upsell.suggestedItem);
              
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: upsellSuffix })}\n\n`)
              );
            }
          }

          // Emit final metadata and recommendations array
          const finalMetadata = {
            onboardingCompleted: true,
            recommendedItems: extraRecommended,
            intent: nluResult.inferredIntent,
          };
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ metadata: finalMetadata })}\n\n`)
          );

          // Save complete AI assistant's conversation to history database
          await saveMessage(sessionId, "ASSISTANT", fullSpeech, {
            intent: nluResult.inferredIntent,
            onboardingCompleted: true,
            recommendedItemIds: extraRecommended.map((i) => i.id),
            conflictDetected: conflicts.conflictDetected,
          });

          controller.close();
        } catch (streamError) {
          console.error("❌ Error while streaming chunks:", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("❌ Critical error in AI stream route:", error);
    return NextResponse.json(
      { error: "Error occurred in the streaming somatic response pipeline." },
      { status: 500 }
    );
  }
}

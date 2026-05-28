import { saveMessage, getRecentMessages } from "@/lib/db/session";
import { runGreeterOrOnboarding } from "./greeterAgent";
import { normalizeInput } from "./multilingualAgent";
import { getRecommendations } from "./recommendationAgent";
import { getPreferences } from "./contextMemoryAgent";
import type { MenuItem } from "@prisma/client";

interface OrchestratorResponse {
  speech: string;
  recommendedItems: MenuItem[];
  onboardingCompleted: boolean;
  intent: string;
}

/**
 * The master AI Orchestrator that receives user input, maintains session memory,
 * routes to specialized agents, and returns interactive, structured chef recommendations.
 */
export async function orchestrateConversation(
  sessionId: string,
  userMessage: string
): Promise<OrchestratorResponse> {
  const trimmedMessage = userMessage.trim();

  // 1. Save user's raw message to conversation history
  await saveMessage(sessionId, "USER", trimmedMessage);

  // 2. Fetch session onboarding status
  const preferences = await getPreferences(sessionId);
  
  // Case A: Onboarding is NOT completed yet
  if (preferences.onboardingCompleted !== true) {
    const onboardingResult = await runGreeterOrOnboarding(sessionId, trimmedMessage);
    
    // Save AI response
    await saveMessage(sessionId, "ASSISTANT", onboardingResult.speech, {
      onboardingCompleted: false,
      step: onboardingResult.nextStep,
    });

    return {
      speech: onboardingResult.speech,
      recommendedItems: [],
      onboardingCompleted: false,
      intent: "onboarding",
    };
  }

  // Case B: Onboarding is completed, process conversational NLU and routing
  try {
    // 3. Normalize input (converts Hinglish/Telugu to English, detects intent)
    const nluResult = await normalizeInput(trimmedMessage);
    console.log(`🌐 [Multilingual NLU] Original: "${trimmedMessage}" -> Normalized: "${nluResult.normalizedQuery}" | Intent: ${nluResult.inferredIntent}`);

    let speech = "";
    let recommendedItems: MenuItem[] = [];

    if (nluResult.inferredIntent === "recommendation" || nluResult.inferredIntent === "general_chat") {
      // 4. Route to recommendationAgent
      const recs = await getRecommendations(sessionId, nluResult.normalizedQuery);
      speech = recs.chefSpeech;
      recommendedItems = recs.recommendedItems;
    } else {
      // Fallback or general response using Gemini for direct conversation
      const recs = await getRecommendations(sessionId, nluResult.normalizedQuery);
      speech = recs.chefSpeech;
      recommendedItems = recs.recommendedItems;
    }

    // 5. Save assistant's response with recommended items metadata
    const responseMetadata = {
      intent: nluResult.inferredIntent,
      onboardingCompleted: true,
      recommendedItemIds: recommendedItems.map((item) => item.id),
    };
    
    await saveMessage(sessionId, "ASSISTANT", speech, responseMetadata);

    return {
      speech,
      recommendedItems,
      onboardingCompleted: true,
      intent: nluResult.inferredIntent,
    };
  } catch (error) {
    console.error("❌ Orchestrator conversational pipeline failed:", error);
    
    const fallbackText = "I apologize, but my culinary thoughts got mixed up. What delicious dish would you like to explore next?";
    await saveMessage(sessionId, "ASSISTANT", fallbackText);

    return {
      speech: fallbackText,
      recommendedItems: [],
      onboardingCompleted: true,
      intent: "fallback",
    };
  }
}

/**
 * Generates an initial welcome message for new tables.
 */
export async function getInitialGreeting(sessionId: string): Promise<OrchestratorResponse> {
  const welcome = await runGreeterOrOnboarding(sessionId);
  
  await saveMessage(sessionId, "ASSISTANT", welcome.speech, {
    onboardingCompleted: false,
    step: 1,
  });

  return {
    speech: welcome.speech,
    recommendedItems: [],
    onboardingCompleted: false,
    intent: "onboarding",
  };
}

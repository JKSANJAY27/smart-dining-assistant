import { getLLM } from "../gemini";

interface SentimentAnalysis {
  frustrationDetected: boolean;
  confusionDetected: boolean;
  dinerTone: "happy" | "neutral" | "frustrated" | "confused" | "impatient";
  empatheticApologyPrefix: string;
}

/**
 * High-speed sentiment and confusion parser.
 * Helps Zara adjust her tone immediately if the customer is struggling or upset.
 */
export async function analyzeSentiment(userMessage: string): Promise<SentimentAnalysis> {
  const lowercaseMsg = userMessage.toLowerCase();
  
  // Fast, cheap regex pre-check to bypass LLM call for plain neutral queries
  const commonFrustrationWords = ["slow", "stupid", "useless", "wrong", "hate", "waiter", "human", "annoying", "garbage", "broken", "empty", "why", "wtf"];
  const isPossiblyUpset = commonFrustrationWords.some(w => lowercaseMsg.includes(w)) || userMessage.includes("!");

  if (!isPossiblyUpset) {
    return {
      frustrationDetected: false,
      confusionDetected: false,
      dinerTone: "neutral",
      empatheticApologyPrefix: "",
    };
  }

  try {
    const model = getLLM("gemini-1.5-flash", 0.5); // Fast inference for sentiment gating
    const systemPrompt = `
You are the hospitality manager at Spice Garden.
Analyze this message from a guest dining at a table and assess their emotional state.

Diner Message: "${userMessage}"

Determine if they are frustrated, confused, impatient, or struggling with the system.
Output ONLY a valid JSON matching this schema:
{
  "frustrationDetected": true | false,
  "confusionDetected": true | false,
  "dinerTone": "happy" | "neutral" | "frustrated" | "confused" | "impatient",
  "empatheticApologyPrefix": "A sincere, highly soothing, 1-sentence apology prefix in Zara's voice if they are frustrated or confused. Otherwise leave empty."
}

Output ONLY valid raw JSON (no markdown formatting, no \`\`\`json blocks).
    `;

    const response = await model.generateContent(systemPrompt);
    const text = response.response.text().trim();
    
    // Clean up markdown block if present
    const jsonStr = text.replace(/^```json/, "").replace(/```$/, "").trim();
    
    return JSON.parse(jsonStr) as SentimentAnalysis;
  } catch (error) {
    console.error("⚠️ Sentiment analysis fallback triggered:", error);
    return {
      frustrationDetected: false,
      confusionDetected: false,
      dinerTone: "neutral",
      empatheticApologyPrefix: "",
    };
  }
}

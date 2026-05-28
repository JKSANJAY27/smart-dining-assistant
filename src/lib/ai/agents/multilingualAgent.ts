import { getLLM } from "../gemini";

interface NormalizerResult {
  normalizedQuery: string;
  detectedLanguage: string;
  isHinglishOrTelugu: boolean;
  inferredIntent: string;
}

/**
 * Normalizes input mixed with Indian regional languages (Hinglish/Telugu-English) into clear English for search.
 */
export async function normalizeInput(userMessage: string): Promise<NormalizerResult> {
  try {
    const model = getLLM("gemini-1.5-flash"); // Flash is perfect and highly optimal for translations
    
    const systemPrompt = `
You are a multilingual linguistic engine for "Spice Garden", an upscale Indian restaurant.
The diner might type their message in:
1. Pure English (e.g. "I want spicy chicken")
2. Hinglish (e.g. "kuch tikha starter dikhao", "paneer butter masala aur naan chahiye")
3. Telugu-English (e.g. "chicken biryani techuko", "mutton curry kavalani undi")

Analyze the user's message and translate/normalize it into a clean, simple English search query optimized for vector semantic search. Also, detect the language style and infer their intent.

Output ONLY a valid JSON object matching the following TypeScript interface:
{
  "normalizedQuery": "clean English translation / search keywords representing their exact food request (e.g. 'spicy starter paneer butter masala naan')",
  "detectedLanguage": "English" | "Hinglish" | "Telugu-English" | "Mixed",
  "isHinglishOrTelugu": true | false,
  "inferredIntent": "recommendation" | "cart_action" | "general_chat" | "checkout"
}

User Message: "${userMessage}"

Output ONLY the raw JSON block without markdown formatting or \`\`\`json wraps.
    `;

    const response = await model.generateContent(systemPrompt);
    const text = response.response.text().trim();
    
    // Clean up markdown block if present
    const jsonStr = text.replace(/^```json/, "").replace(/```$/, "").trim();
    
    const parsed = JSON.parse(jsonStr) as NormalizerResult;
    return parsed;
  } catch (error) {
    console.error("⚠️ Multilingual normalizer error, falling back to original text:", error);
    
    // Graceful fallback
    return {
      normalizedQuery: userMessage,
      detectedLanguage: "English",
      isHinglishOrTelugu: false,
      inferredIntent: "recommendation",
    };
  }
}

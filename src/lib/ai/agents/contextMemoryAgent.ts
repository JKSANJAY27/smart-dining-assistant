import { getSessionById, updateSessionPreferences } from "@/lib/db/session";
import { getLLM } from "../gemini";

export interface UserPreferences {
  dietPreference?: "veg" | "non-veg" | "vegan" | "gluten-free" | "none" | "";
  spiceLevel?: "mild" | "medium" | "hot" | "";
  allergens?: string[];
  dislikes?: string[];
  likes?: string[];
  onboardingCompleted?: boolean;
  onboardingStep?: number;
}

/**
 * Get active preferences for a given session.
 */
export async function getPreferences(sessionId: string): Promise<UserPreferences> {
  const session = await getSessionById(sessionId);
  if (!session || !session.preferences) return {};
  return session.preferences as UserPreferences;
}

/**
 * Update a specific preference field.
 */
export async function updatePreference<K extends keyof UserPreferences>(
  sessionId: string,
  key: K,
  value: UserPreferences[K]
): Promise<UserPreferences> {
  const session = await updateSessionPreferences(sessionId, key as string, value);
  return session.preferences as UserPreferences;
}

/**
 * Uses Gemini to parse potential user preferences (dietary, spice, allergens) from conversational text.
 */
export async function parseAndSavePreferences(
  sessionId: string,
  userMessage: string
): Promise<UserPreferences> {
  const currentPrefs = await getPreferences(sessionId);
  
  try {
    const model = getLLM("gemini-1.5-flash"); // Flash is perfect and fast for background metadata parsing
    const systemPrompt = `
You are a context memory extraction system for "Spice Garden", an upscale Indian restaurant.
Analyze the user's message and extract any dietary preferences, spice level preferences, food likes/dislikes, or allergens mentioned.

Examine the following JSON schema of the current user preferences:
{
  "dietPreference": "veg" | "non-veg" | "vegan" | "gluten-free" | "none" | "",
  "spiceLevel": "mild" | "medium" | "hot" | "",
  "allergens": ["list", "of", "allergens"],
  "dislikes": ["list", "of", "disliked", "foods", "or", "ingredients"],
  "likes": ["list", "of", "liked", "foods", "or", "ingredients"]
}

Output ONLY a valid JSON block containing the newly extracted fields to update. If something is not mentioned, do NOT include it.
If the user says they don't eat chicken/meat, dietPreference is "veg". If they are looking for gluten-free or lactose-free, add it or set dietPreference.
Spice levels are: "mild" (tikha nahi), "medium" (medium, tikha chalega), "hot" (bohot tikha, very spicy).

User Message: "${userMessage}"
Current Preferences: ${JSON.stringify(currentPrefs)}

Output ONLY valid raw JSON (no markdown formatting, no \`\`\`json blocks). Example:
{"dietPreference":"veg","spiceLevel":"hot","allergens":["peanuts"]}
    `;

    const response = await model.generateContent(systemPrompt);
    const text = response.response.text().trim();
    
    // Clean up markdown block if present
    const jsonStr = text.replace(/^```json/, "").replace(/```$/, "").trim();
    
    const parsed = JSON.parse(jsonStr) as Partial<UserPreferences>;
    
    // Merge and save to database
    let updatedPrefs = { ...currentPrefs };
    
    if (parsed.dietPreference !== undefined) {
      updatedPrefs = await updatePreference(sessionId, "dietPreference", parsed.dietPreference);
    }
    if (parsed.spiceLevel !== undefined) {
      updatedPrefs = await updatePreference(sessionId, "spiceLevel", parsed.spiceLevel);
    }
    if (parsed.allergens && Array.isArray(parsed.allergens)) {
      const mergedAllergens = Array.from(
        new Set([...(currentPrefs.allergens || []), ...parsed.allergens])
      );
      updatedPrefs = await updatePreference(sessionId, "allergens", mergedAllergens);
    }
    if (parsed.dislikes && Array.isArray(parsed.dislikes)) {
      const mergedDislikes = Array.from(
        new Set([...(currentPrefs.dislikes || []), ...parsed.dislikes])
      );
      updatedPrefs = await updatePreference(sessionId, "dislikes", mergedDislikes);
    }
    if (parsed.likes && Array.isArray(parsed.likes)) {
      const mergedLikes = Array.from(
        new Set([...(currentPrefs.likes || []), ...parsed.likes])
      );
      updatedPrefs = await updatePreference(sessionId, "likes", mergedLikes);
    }

    return updatedPrefs;
  } catch (error) {
    console.error("⚠️ Error parsing preferences from user message:", error);
    return currentPrefs;
  }
}

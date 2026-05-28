import { searchSemanticMenu } from "../vectorStore";
import { getPreferences, type UserPreferences } from "./contextMemoryAgent";
import { getLLM } from "../gemini";
import type { MenuItem } from "@prisma/client";

interface RecommendationResult {
  chefSpeech: string;
  recommendedItems: MenuItem[];
}

/**
 * Direct allergy-filtering logic. Returns true if the item is safe.
 */
function isItemSafeFromAllergens(item: MenuItem, allergens: string[]): boolean {
  if (!allergens || allergens.length === 0) return true;
  
  const itemAllergens = (item.allergens || []).map((a) => a.toLowerCase().trim());
  
  // Check if any of user's allergens are listed in item's allergens
  for (const userAllergen of allergens) {
    const ua = userAllergen.toLowerCase().trim();
    if (itemAllergens.some((ia) => ia.includes(ua) || ua.includes(ia))) {
      return false; // Found allergen match, item is UNSAFE
    }
    // Also do a keyword check in tags/description just in case
    const description = (item.description || "").toLowerCase();
    const name = item.name.toLowerCase();
    if (
      (ua === "peanut" || ua === "nuts") &&
      (description.includes("peanut") || description.includes("cashew") || description.includes("walnut") || name.includes("peanut"))
    ) {
      return false;
    }
    if (
      (ua === "dairy" || ua === "milk") &&
      (description.includes("butter") || description.includes("cheese") || description.includes("cream") || description.includes("paneer"))
    ) {
      // Allow paneer unless strictly dairy allergic, but be cautious
      if (ua === "dairy") return false;
    }
  }
  
  return true;
}

/**
 * Filter items by vegetarian/vegan preferences.
 */
function matchesDietaryPreference(item: MenuItem, diet: UserPreferences["dietPreference"]): boolean {
  if (!diet || diet === "none") return true;
  if (diet === "veg" && !item.isVeg) return false;
  if (diet === "non-veg" && item.isVeg) return true; // Non-veg users can eat veg
  if (diet === "vegan" && (!item.isVeg || item.tags.some(t => t.toLowerCase() === "dairy" || t.toLowerCase() === "paneer"))) return false;
  if (diet === "gluten-free" && item.tags.some(t => t.toLowerCase() === "wheat" || t.toLowerCase() === "gluten")) return false;
  return true;
}

/**
 * Generates tailored menu recommendations using vector search + allergy filters + Gemini copywriter.
 */
export async function getRecommendations(
  sessionId: string,
  normalizedQuery: string,
  limit = 3
): Promise<RecommendationResult> {
  // 1. Get user preferences
  const preferences = await getPreferences(sessionId);
  const userAllergens = preferences.allergens || [];
  const dietPref = preferences.dietPreference;
  const spicePref = preferences.spiceLevel;

  // 2. Perform broad semantic vector search
  // We query double the limit to have plenty of candidates left after hard allergy filtering
  const vectorMatches = await searchSemanticMenu(normalizedQuery, limit * 3);
  
  // Extract MenuItem and score
  const items = vectorMatches.map(m => m.menuItem);

  // 3. Apply strict allergy filtering & dietary preferences
  const safeItems = items.filter((item) => {
    // Allergy check (critical safety)
    if (!isItemSafeFromAllergens(item, userAllergens)) {
      console.log(`🛡️ [Safety Filter] Filtered out ${item.name} due to allergens: ${userAllergens.join(", ")}`);
      return false;
    }

    // Dietary check
    if (!matchesDietaryPreference(item, dietPref)) {
      return false;
    }

    return true;
  });

  // 4. Spice level sorting/prioritization (optional recommendation score adjust)
  const sortedItems = [...safeItems];
  if (spicePref === "mild") {
    // Put non-spicy first
    sortedItems.sort((a, b) => (a.isSpicy ? 1 : 0) - (b.isSpicy ? 1 : 0));
  } else if (spicePref === "hot") {
    // Put spicy first
    sortedItems.sort((a, b) => (b.isSpicy ? 1 : 0) - (a.isSpicy ? 1 : 0));
  }

  // Slice to the requested limit
  const finalRecommendations = sortedItems.slice(0, limit);

  // If no items match, return early
  if (finalRecommendations.length === 0) {
    return {
      chefSpeech: "I searched our menu, but couldn't find any items matching your request that are safe given your dietary restrictions or allergens. Could I suggest something else?",
      recommendedItems: [],
    };
  }

  // 5. Query Gemini to craft a premium Michelin-star chef response
  try {
    const model = getLLM("gemini-2.0-flash-exp", 0.7);
    
    const dishDescriptions = finalRecommendations.map(
      (item) => `- **${item.name}** (₹${Number(item.price)}): ${item.description} [Veg: ${item.isVeg}, Spicy: ${item.isSpicy}]`
    ).join("\n");

    const systemPrompt = `
You are "Zara", a world-class, extremely helpful Michelin-starred head chef and sommelier at the premium restaurant "Spice Garden".
You are presenting recommendations to a diner based on their request and their dietary profile.

Diner Profile:
- Diet preference: ${dietPref || "None"}
- Spice level: ${spicePref || "None"}
- Allergens: ${userAllergens.length > 0 ? userAllergens.join(", ") : "None"}

Their Search request: "${normalizedQuery}"

We selected these top matched dishes from our menu:
${dishDescriptions}

Write a short, sophisticated, and appetizing response (max 3-4 sentences) presenting these options.
Explain briefly WHY these dishes are perfect for them based on their profile. Make it sound mouth-watering, premium, and welcoming! Do not list price or tags in your text, as they are rendered as cards.
    `;

    const response = await model.generateContent(systemPrompt);
    const chefSpeech = response.response.text().trim();

    return {
      chefSpeech,
      recommendedItems: finalRecommendations,
    };
  } catch (error) {
    console.error("❌ Error generating chef speech via Gemini:", error);
    
    // Fallback chef speech
    return {
      chefSpeech: `I have selected some exquisite items for you! I highly recommend trying the ${finalRecommendations[0].name}, as well as the ${finalRecommendations[1]?.name || "other specialties"} which perfectly suit your palate.`,
      recommendedItems: finalRecommendations,
    };
  }
}

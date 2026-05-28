import { getLLM } from "@/lib/ai/gemini";
import { redis } from "@/lib/redis";
import type { MenuItem } from "@prisma/client";

// Safe fallback taglines based on tags in case API/Redis fails or is unavailable
const STATIC_FALLBACK_TAGLINES: Record<string, string> = {
  veg: "Fresh, garden-picked vegetarian delicacy.",
  "non-veg": "Succulent, perfectly spiced gourmet meat.",
  spicy: "Bold and fiery, packed with rich flavor.",
  bestseller: "Loved by diners — highly recommended!",
  "chef-special": "Exquisite signature dish by our Chef.",
  light: "Crisp, refreshing, and guilt-free choice.",
  "quick-serve": "Ready in minutes without compromising flavor.",
};

function getStaticFallback(item: MenuItem): string {
  for (const tag of item.tags) {
    if (STATIC_FALLBACK_TAGLINES[tag]) {
      return STATIC_FALLBACK_TAGLINES[tag];
    }
  }
  return item.isVeg 
    ? "Delightfully fresh and expertly prepared." 
    : "Savory, rich flavors cooked to perfection.";
}

/**
 * Generate or fetch cached AI tagline for a MenuItem
 */
export async function getAITagline(item: MenuItem): Promise<string> {
  const cacheKey = `tagline:${item.id}`;

  // 1. Try to read from Upstash Redis
  try {
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (err) {
    console.warn("⚠️ Redis fetch failed, proceeding to Gemini:", err);
  }

  // 2. Call Gemini for tagline generation
  try {
    const model = getLLM();
    const prompt = `You are a premium culinary writer and gourmet concierge for a high-end restaurant named Spice Garden.
Create a highly enticing, sophisticated, 1-sentence food description (under 8 words) for this menu item to encourage orders.

Item: ${item.name}
Description: ${item.description}
Dietary: ${item.isVeg ? "Vegetarian" : "Non-Vegetarian"}, ${item.isSpicy ? "Spicy" : "Mild"}
Tags: ${item.tags.join(", ")}
Price: ₹${Number(item.price)}

Format guidelines:
- Extremely concise, elegant, emotional, sensory.
- Under 8 words.
- Do NOT repeat the name of the item.
- Do NOT use quotation marks, bullet points, or markdown.
- Examples: 
  - "Crisp golden layers with warm spiced potato."
  - "Bold, slow-simmered saffron and tender lamb."
  - "A cool, cardamom-infused velvet finish."

Your response:`;

    const response = await model.generateContent(prompt);
    const generated = response.response.text().trim().replace(/^["']|["']$/g, ""); // strip quotes

    if (generated && generated.length > 3) {
      // Save to Upstash Redis (no expiry or long expiry)
      try {
        await redis.set(cacheKey, generated);
      } catch (cacheErr) {
        console.warn("⚠️ Failed to cache tagline in Redis:", cacheErr);
      }
      return generated;
    }
  } catch (geminiErr) {
    console.error(`❌ Gemini tagline generation failed for item ${item.id}:`, geminiErr);
  }

  // 3. Fallback to static tagline if Gemini fails
  return getStaticFallback(item);
}

/**
 * Bulk fetch or generate taglines for a list of items
 */
export async function getBulkTaglines(items: MenuItem[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  // To avoid hitting Gemini concurrently for all items, let's fetch in parallel but check cache first
  const cachePromises = items.map(async (item) => {
    try {
      const cached = await redis.get<string>(`tagline:${item.id}`);
      if (cached) {
        results[item.id] = cached;
      }
    } catch {
      // ignore cache check errors
    }
  });

  await Promise.all(cachePromises);

  // Generate missing taglines
  const missingItems = items.filter((item) => !results[item.id]);

  if (missingItems.length > 0) {
    // Call getAITagline sequentially or in small batches to avoid rate limits
    // Since this runs on initial load, let's process them
    for (const item of missingItems) {
      results[item.id] = await getAITagline(item);
    }
  }

  return results;
}

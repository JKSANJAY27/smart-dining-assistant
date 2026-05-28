import { getCartTool } from "../tools/cartTools";
import { getPreferences } from "./contextMemoryAgent";
import type { CartItemWithMenuItem } from "@/lib/db/cart";
import { getLLM } from "../gemini";

interface TableConflict {
  conflictDetected: boolean;
  conflictType: "allergen_alert" | "diet_mismatch" | "none";
  warningMessage: string;
  conflictingItems: string[];
}

/**
 * Reviews the shared table cart against combined diner profiles to spot safety violations.
 */
export async function checkGroupCartConflicts(sessionId: string): Promise<TableConflict> {
  try {
    const cart = await getCartTool(sessionId);
    const cartItems = cart.items;

    if (cartItems.length === 0) {
      return { conflictDetected: false, conflictType: "none", warningMessage: "", conflictingItems: [] };
    }

    // 1. Load active table preferences
    const preferences = await getPreferences(sessionId);
    const allergens = preferences.allergens || [];
    const dietPreference = preferences.dietPreference;

    const conflictingItems: string[] = [];
    let warningMessage = "";
    let conflictType: "allergen_alert" | "diet_mismatch" | "none" = "none";

    // 2. Perform allergy safety scans across all cart items
    if (allergens.length > 0) {
      for (const item of cartItems) {
        const itemAllergens = (item.menuItem.allergens || []).map((a) => a.toLowerCase().trim());
        const description = (item.menuItem.description || "").toLowerCase();
        const name = item.menuItem.name.toLowerCase();

        for (const allergen of allergens) {
          const al = allergen.toLowerCase().trim();
          
          // Match in allergen tags or keyword matching
          const directMatch = itemAllergens.some((ia) => ia.includes(al) || al.includes(ia));
          const keywordMatch = (al === "peanut" || al === "nuts") && 
            (description.includes("peanut") || description.includes("cashew") || description.includes("walnut") || name.includes("peanut") || name.includes("cashew"));
          const dairyMatch = (al === "dairy" || al === "milk") && 
            (description.includes("butter") || description.includes("cheese") || description.includes("cream") || description.includes("paneer") || name.includes("paneer"));

          if (directMatch || keywordMatch || dairyMatch) {
            conflictingItems.push(item.menuItem.name);
            conflictType = "allergen_alert";
          }
        }
      }
    }

    // 3. Perform vegetarian compatibility warnings (Optional, soft notice)
    // If table preference is strictly "veg" (e.g. someone requested pure veg table in onboarding),
    // and someone else added a non-veg item.
    if (conflictType === "none" && dietPreference === "veg") {
      const nonVegItems = cartItems.filter((i) => !i.menuItem.isVeg);
      if (nonVegItems.length > 0) {
        conflictingItems.push(...nonVegItems.map((i) => i.menuItem.name));
        conflictType = "diet_mismatch";
      }
    }

    // 4. Generate contextual warning speech from Chef Zara using Gemini if conflict exists
    if (conflictType !== "none" && conflictingItems.length > 0) {
      const model = getLLM("gemini-1.5-flash", 0.7);
      
      const systemPrompt = `
You are Chef "Zara" at Spice Garden.
You have detected a dining conflict at a shared table.

Conflict context:
- Type of conflict: ${conflictType === "allergen_alert" ? "Allergy Safety Clash (CRITICAL)" : "Vegetarian Table Mismatch (Soft Notice)"}
- Table Allergens declared: ${allergens.join(", ") || "None"}
- Diet Preference declared: ${dietPreference || "None"}
- Conflicting cart items added to table cart: ${conflictingItems.join(", ")}

Write a highly polite, helpful, and professional 1-2 sentence warning to alert the guests.
If it is an ALLERGEN clash, start with a cautionary warning and explain that some guests have declared an allergy to "${allergens.join(", ")}" but "${conflictingItems.join(", ")}" was added. Suggest they review or substitute it.
If it is a diet mismatch, keep it friendly, noting that a non-vegetarian dish was added to a vegetarian-designated table.
Do not use pushy or scary language, keep it in Zara's premium, warm hospitality tone.
      `;

      const response = await model.generateContent(systemPrompt);
      warningMessage = response.response.text().trim();

      return {
        conflictDetected: true,
        conflictType,
        warningMessage,
        conflictingItems,
      };
    }

    return {
      conflictDetected: false,
      conflictType: "none",
      warningMessage: "",
      conflictingItems: [],
    };
  } catch (error) {
    console.error("⚠️ Error checking group conflicts:", error);
    return { conflictDetected: false, conflictType: "none", warningMessage: "", conflictingItems: [] };
  }
}

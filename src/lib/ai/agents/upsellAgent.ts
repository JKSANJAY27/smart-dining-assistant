import { getCartTool } from "../tools/cartTools";
import { searchSemanticMenu } from "../vectorStore";
import { getLLM } from "../gemini";
import type { MenuItem } from "@prisma/client";

export interface UpsellRecommendation {
  triggerHit: string;
  suggestedItem: MenuItem | null;
  upsellCopy: string;
}

/**
 * High-performance upsell coordinator.
 * Analyzes the cart items and triggers contextual recommendations.
 */
export async function getContextualUpsell(
  sessionId: string
): Promise<UpsellRecommendation | null> {
  try {
    const cart = await getCartTool(sessionId);
    const cartItems = cart.items;

    if (cartItems.length === 0) return null;

    let triggerHit = "";
    let searchQuery = "";
    let reasonPrompt = "";

    // Extract item categories and attributes in cart
    const itemIds = cartItems.map((i) => i.menuItem.id);
    const hasBeverage = cartItems.some((i) => i.menuItem.category.toLowerCase() === "beverages" || i.menuItem.category.toLowerCase() === "drinks");
    const hasMainCourse = cartItems.some((i) => i.menuItem.category.toLowerCase() === "main course" || i.menuItem.category.toLowerCase() === "mains");
    const hasBreadOrRice = cartItems.some((i) => {
      const cat = i.menuItem.category.toLowerCase();
      const name = i.menuItem.name.toLowerCase();
      return cat === "breads" || cat === "rice" || name.includes("naan") || name.includes("roti") || name.includes("rice") || name.includes("biryani");
    });
    const hasDessert = cartItems.some((i) => i.menuItem.category.toLowerCase() === "dessert" || i.menuItem.category.toLowerCase() === "desserts");
    const dryStarterCount = cartItems.filter((i) => {
      const cat = i.menuItem.category.toLowerCase();
      const desc = i.menuItem.description.toLowerCase();
      return (cat === "starters" || cat === "appetizers") && !desc.includes("soup") && !desc.includes("gravy");
    }).length;
    const spicyCount = cartItems.filter((i) => i.menuItem.isSpicy).length;
    const cartSubtotal = cart.subtotal;

    // ─── Trigger Point 1: Dry starters but no drinks ──────────────────────────
    if (dryStarterCount >= 1 && !hasBeverage) {
      triggerHit = "starter_no_beverage";
      searchQuery = "cold lassi mint mojito masala chaas refreshing beverage drinks";
      reasonPrompt = "The guest has ordered dry appetizers (like tandoori or tikka starters) but has no beverages yet. Recommend a cold, refreshing mocktail or lassi to perfectly quench their thirst.";
    }
    // ─── Trigger Point 2: Mains but no bread/rice ────────────────────────────
    else if (hasMainCourse && !hasBreadOrRice) {
      triggerHit = "mains_no_sides";
      searchQuery = "garlic butter naan tandoori roti steam basmati rice jeera pilaf";
      reasonPrompt = "The guest has added rich main course curries but no breads or rice. Strongly recommend freshly baked garlic naan, butter naan, or long-grain basmati rice to accompany their gravy.";
    }
    // ─── Trigger Point 3: Spicy overload (> 2 items are spicy) ────────────────
    else if (spicyCount >= 2 && !cartItems.some(i => i.menuItem.name.toLowerCase().includes("raita") || i.menuItem.name.toLowerCase().includes("lassi"))) {
      triggerHit = "spicy_balance";
      searchQuery = "cucumber mint raita sweet mango lassi curd cold yogurt";
      reasonPrompt = "The guest has multiple highly spicy dishes in their cart. Recommend a soothing Cucumber Mint Raita or a sweet Mango Lassi to serve as a cooling palette balance.";
    }
    // ─── Trigger Point 4: Cart Subtotal > ₹1000 with no dessert ───────────────
    else if (cartSubtotal >= 1000 && !hasDessert) {
      triggerHit = "premium_dessert";
      searchQuery = "shahi gulab jamun kesar rasmalai kulfi chocolate ice cream";
      reasonPrompt = "The guest has a premium cart value over ₹1000 but no sweet endings yet. Suggest one of our master handcrafted Indian desserts like warm Gulab Jamun or chilled Kesar Rasmalai.";
    }
    // ─── Trigger Point 5: Main courses and breads added, but no drinks ────────
    else if (hasMainCourse && hasBreadOrRice && !hasBeverage) {
      triggerHit = "meal_beverage";
      searchQuery = "jal jeera fresh lime soda mango lassi thandai cold drink";
      reasonPrompt = "The guest is assembling a full meal (curry + naan/rice) but has no drinks. Pitch a traditional mocktail or fresh lime soda to elevate the dining experience.";
    }
    // ─── Trigger Point 6: High Value Cart (> ₹1500) ───────────────────────────
    else if (cartSubtotal >= 1500) {
      triggerHit = "premium_chef_special";
      searchQuery = "chef special signature chicken kebab mutton shanks biryani platter";
      reasonPrompt = "The guest is enjoying a premium feast. Recommend our highest-rated premium chef's special mocktail or premium platter as an exclusive treat.";
    }

    if (!triggerHit || !searchQuery) return null;

    // Search the vector store for a matching upsell item
    const matches = await searchSemanticMenu(searchQuery, 4);
    
    // Select the first match that is NOT already in the cart
    const candidate = matches.find((m) => !itemIds.includes(m.menuItem.id));
    if (!candidate) return null;

    const suggestedItem = candidate.menuItem;

    // Call Gemini to generate mouth-watering chef copywriting for the upsell
    const model = getLLM("gemini-1.5-flash", 0.8);
    const systemPrompt = `
You are "Zara", the premium culinary host at Spice Garden.
You want to suggest an additional menu item to the diner to improve their meal experience.

Context for Suggestion:
${reasonPrompt}

Suggested Item to Pitch:
- Name: ${suggestedItem.name}
- Category: ${suggestedItem.category}
- Description: ${suggestedItem.description}

Diner's Current Cart Items:
${cartItems.map((i) => `- ${i.menuItem.name} (Qty: ${i.quantity})`).join("\n")}

Write a highly enticing, 1-2 sentence suggestive pitch from Chef Zara.
Describe how the flavor/texture of "${suggestedItem.name}" elevates or balances the dishes they've already added. Make it sound sophisticated, helpful, and mouth-watering.
Do not mention prices or use pushy sales language. Keep it extremely natural.
    `;

    const response = await model.generateContent(systemPrompt);
    const upsellCopy = response.response.text().trim();

    return {
      triggerHit,
      suggestedItem,
      upsellCopy,
    };
  } catch (error) {
    console.error("⚠️ Error in upsell agent:", error);
    return null;
  }
}

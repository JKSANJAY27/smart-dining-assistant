import { searchSemanticMenu } from "../vectorStore";
import { getComplementaryItems, getPopularItems, getMenuItemById } from "@/lib/db/menu";

/**
 * Tool wrapper to search the restaurant menu semantically.
 */
export async function searchMenuTool(query: string, limit = 5) {
  return searchSemanticMenu(query, limit);
}

/**
 * Tool wrapper to retrieve complementary food/drink items.
 */
export async function getComplementaryTool(itemId: string) {
  return getComplementaryItems(itemId);
}

/**
 * Tool wrapper to retrieve top popular items.
 */
export async function getPopularTool(limit = 4) {
  return getPopularItems(limit);
}

/**
 * Tool wrapper to look up item details by ID.
 */
export async function getMenuItemDetailsTool(itemId: string) {
  return getMenuItemById(itemId);
}

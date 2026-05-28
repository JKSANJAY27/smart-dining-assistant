import { 
  getCartItems, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  calculateCartTotal 
} from "@/lib/db/cart";

/**
 * Tool wrapper to retrieve current cart items for a session.
 */
export async function getCartTool(sessionId: string) {
  const items = await getCartItems(sessionId);
  const totals = calculateCartTotal(items);
  return { items, ...totals };
}

/**
 * Tool wrapper to add an item to the session's cart.
 */
export async function addItemToCartTool(
  sessionId: string,
  menuItemId: string,
  quantity = 1,
  addedBy = "Guest",
  specialInstructions?: string
) {
  return addToCart(sessionId, menuItemId, quantity, addedBy, specialInstructions);
}

/**
 * Tool wrapper to modify cart item quantity or instructions.
 */
export async function updateCartItemTool(
  sessionId: string,
  cartItemId: string,
  quantity?: number,
  specialInstructions?: string
) {
  return updateCartItem(cartItemId, sessionId, { quantity, specialInstructions });
}

/**
 * Tool wrapper to delete an item from the cart.
 */
export async function removeItemFromCartTool(sessionId: string, cartItemId: string) {
  return removeFromCart(cartItemId, sessionId);
}

/**
 * Tool wrapper to empty the entire cart.
 */
export async function clearCartTool(sessionId: string) {
  return clearCart(sessionId);
}

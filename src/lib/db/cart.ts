import prisma from "@/lib/prisma";
import type { CartItem, MenuItem } from "@prisma/client";

export type CartItemWithMenuItem = CartItem & { menuItem: MenuItem };

/** Get all cart items for a session */
export async function getCartItems(sessionId: string): Promise<CartItemWithMenuItem[]> {
  return prisma.cartItem.findMany({
    where: { sessionId },
    include: { menuItem: true },
    orderBy: { createdAt: "asc" },
  });
}

/** Add item to cart (or increment qty if already exists) */
export async function addToCart(
  sessionId: string,
  menuItemId: string,
  quantity: number = 1,
  addedBy: string = "Guest",
  specialInstructions?: string
): Promise<CartItemWithMenuItem> {
  // Check if item already in cart for this session
  const existing = await prisma.cartItem.findFirst({
    where: { sessionId, menuItemId },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity,
        specialInstructions: specialInstructions ?? existing.specialInstructions,
      },
      include: { menuItem: true },
    });
  }

  return prisma.cartItem.create({
    data: {
      sessionId,
      menuItemId,
      quantity,
      addedBy,
      specialInstructions,
    },
    include: { menuItem: true },
  });
}

/** Update cart item quantity or instructions */
export async function updateCartItem(
  cartItemId: string,
  sessionId: string,
  data: { quantity?: number; specialInstructions?: string }
): Promise<CartItemWithMenuItem> {
  // Verify ownership
  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, sessionId },
  });
  if (!item) throw new Error("Cart item not found");

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data,
    include: { menuItem: true },
  });
}

/** Remove item from cart */
export async function removeFromCart(
  cartItemId: string,
  sessionId: string
): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, sessionId },
  });
}

/** Clear all items from cart */
export async function clearCart(sessionId: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { sessionId } });
}

/** Calculate cart total */
export function calculateCartTotal(items: CartItemWithMenuItem[]): {
  subtotal: number;
  gst: number;
  total: number;
} {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.menuItem.price) * item.quantity,
    0
  );
  const gstRate = 0.05; // 5% GST
  const gst = Math.round(subtotal * gstRate);
  const total = subtotal + gst;
  return { subtotal, gst, total };
}

/** Get cart item count */
export async function getCartItemCount(sessionId: string): Promise<number> {
  const result = await prisma.cartItem.aggregate({
    where: { sessionId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

/** Check if item is already in cart */
export async function isItemInCart(
  sessionId: string,
  menuItemId: string
): Promise<boolean> {
  const count = await prisma.cartItem.count({
    where: { sessionId, menuItemId },
  });
  return count > 0;
}

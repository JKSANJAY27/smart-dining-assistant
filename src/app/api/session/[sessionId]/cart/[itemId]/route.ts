import { NextRequest, NextResponse } from "next/server";
import { getCartItems, updateCartItem, removeFromCart, calculateCartTotal } from "@/lib/db/cart";

export const dynamic = "force-dynamic";

// PATCH: Update quantity or special instructions for a specific item in the cart
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; itemId: string }> }
) {
  try {
    const { sessionId, itemId } = await params;
    const body = await request.json();
    const { quantity, specialInstructions } = body;

    if (!sessionId || !itemId) {
      return NextResponse.json(
        { success: false, error: "Session ID and Item ID are required" },
        { status: 400 }
      );
    }

    // Update cart item (database helper checks ownership via sessionId)
    await updateCartItem(itemId, sessionId, {
      quantity: quantity !== undefined ? Number(quantity) : undefined,
      specialInstructions,
    });

    // Retrieve updated cart and recalculate totals
    const items = await getCartItems(sessionId);
    const totals = calculateCartTotal(items);

    return NextResponse.json({
      success: true,
      data: {
        items,
        ...totals,
      },
    });
  } catch (error) {
    console.error("[Cart PATCH API] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a specific item from the cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; itemId: string }> }
) {
  try {
    const { sessionId, itemId } = await params;

    if (!sessionId || !itemId) {
      return NextResponse.json(
        { success: false, error: "Session ID and Item ID are required" },
        { status: 400 }
      );
    }

    // Remove item from database
    await removeFromCart(itemId, sessionId);

    // Retrieve updated cart and recalculate totals
    const items = await getCartItems(sessionId);
    const totals = calculateCartTotal(items);

    return NextResponse.json({
      success: true,
      data: {
        items,
        ...totals,
      },
    });
  } catch (error) {
    console.error("[Cart DELETE API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCartItems, addToCart, calculateCartTotal } from "@/lib/db/cart";

export const dynamic = "force-dynamic";

// GET: Retrieve the active cart and its calculated totals
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

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
    console.error("[Cart GET API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve cart items" },
      { status: 500 }
    );
  }
}

// POST: Add a new menu item to the cart (or increment its quantity)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { menuItemId, quantity = 1, addedBy = "Guest", specialInstructions } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!menuItemId) {
      return NextResponse.json(
        { success: false, error: "Menu Item ID is required" },
        { status: 400 }
      );
    }

    // Add item to cart (database helper handles duplicates)
    const cartItem = await addToCart(
      sessionId,
      menuItemId,
      quantity,
      addedBy,
      specialInstructions
    );

    // Retrieve full cart to return updated totals
    const items = await getCartItems(sessionId);
    const totals = calculateCartTotal(items);

    return NextResponse.json({
      success: true,
      data: {
        item: cartItem,
        cart: {
          items,
          ...totals,
        },
      },
    });
  } catch (error) {
    console.error("[Cart POST API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

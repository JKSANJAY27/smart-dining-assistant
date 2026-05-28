import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCartItems, calculateCartTotal } from "@/lib/db/cart";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { customerName, customerPhone, specialNotes } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, error: "Customer name and phone number are required" },
        { status: 400 }
      );
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");

    // 1. Verify the session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // 2. Fetch cart items for the session
    const cartItems = await getCartItems(sessionId);
    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty. Cannot place an empty order." },
        { status: 400 }
      );
    }

    // 3. Verify OTP exists and is verified for this phone number
    const verifiedOtp = await prisma.otpVerification.findFirst({
      where: {
        phone: cleanPhone,
        verified: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verifiedOtp) {
      return NextResponse.json(
        { success: false, error: "Mobile number has not been verified via OTP." },
        { status: 400 }
      );
    }

    // 4. Calculate total and tax amounts (using cart DB helpers)
    const { subtotal, gst, total } = calculateCartTotal(cartItems);

    // Calculate estimated wait time based on menu items prep time (take max + buffer, default to 15m)
    const prepTimes = cartItems.map((item) => item.menuItem.prepTime || 12);
    const estimatedWait = Math.max(...prepTimes, 15);

    // 5. Database Transaction to create order, create order items, delete cart items, and update session
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          sessionId,
          customerName,
          customerPhone: cleanPhone,
          totalAmount: total,
          taxAmount: gst,
          estimatedWait,
          specialNotes,
          status: "PENDING",
        },
      });

      // Create order items
      const orderItemData = cartItems.map((item) => ({
        orderId: newOrder.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.menuItem.price,
        specialInstructions: item.specialInstructions,
      }));

      await tx.orderItem.createMany({
        data: orderItemData,
      });

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { sessionId },
      });

      // Update the session status
      await tx.session.update({
        where: { id: sessionId },
        data: { status: "ORDERED" },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      data: {
        orderId: order.id,
        estimatedWait: order.estimatedWait,
        totalAmount: Number(order.totalAmount),
      },
    });
  } catch (error: any) {
    console.error("[Create Order API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to place order" },
      { status: 500 }
    );
  }
}

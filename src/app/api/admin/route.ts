import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch all kitchen orders
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // 2. Fetch all active dining table sessions
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cartItems: {
          include: {
            menuItem: true,
          },
        },
        orders: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order.id,
          sessionId: order.sessionId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          status: order.status,
          totalAmount: Number(order.totalAmount),
          taxAmount: Number(order.taxAmount),
          estimatedWait: order.estimatedWait,
          specialNotes: order.specialNotes,
          createdAt: order.createdAt,
          items: order.orderItems.map((item) => ({
            id: item.id,
            menuItemName: item.menuItem.name,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          })),
        })),
        sessions: sessions.map((session) => ({
          id: session.id,
          tableId: session.tableId,
          status: session.status,
          guestCount: session.guestCount,
          createdAt: session.createdAt,
          cartItemsCount: session.cartItems.reduce((acc, i) => acc + i.quantity, 0),
          ordersCount: session.orders.length,
        })),
      },
    });
  } catch (error: any) {
    console.error("[Admin API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load admin logs." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
          menuItem: item.menuItem,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          specialInstructions: item.specialInstructions,
        })),
      },
    });
  } catch (error: any) {
    console.error("[Get Order API] Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to retrieve order",
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Order status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("[Patch Order Status API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}

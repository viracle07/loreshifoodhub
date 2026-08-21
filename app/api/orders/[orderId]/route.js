import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  request,
  { params }
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const orderDoc = await adminDb
      .collection("orders")
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    const data = orderDoc.data();

    /*
     * IMPORTANT:
     * Customers can only access their
     * own orders.
     */
    if (data.userId !== currentUser.uid) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden.",
        },
        { status: 403 }
      );
    }

    const order = {
      id: orderDoc.id,

      orderNumber:
        data.orderNumber || "",

      userId:
        data.userId || "",

      customer:
        data.customer || {},

      delivery:
        data.delivery || {},

      items:
        Array.isArray(data.items)
          ? data.items
          : [],

      subtotal:
        Number(data.subtotal || 0),

      deliveryFee:
        Number(
          data.deliveryFee || 0
        ),

      total:
        Number(data.total || 0),

      status:
        data.status || "pending",

      paymentStatus:
        data.paymentStatus ||
        "unpaid",

      paymentMethod:
        data.paymentMethod ||
        null,

      createdAt:
        data.createdAt
          ?.toDate?.()
          ?.toISOString() || null,

      updatedAt:
        data.updatedAt
          ?.toDate?.()
          ?.toISOString() || null,
    };

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Get order details error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load the order.",
      },
      { status: 500 }
    );
  }
}
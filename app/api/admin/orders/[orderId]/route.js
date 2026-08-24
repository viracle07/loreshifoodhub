import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import { getCurrentAdmin } from "@/lib/auth/admin-auth";

const ALLOWED_STATUSES = [
  "pending",
  "processing",
  "confirmed",
  "completed",
  "cancelled",
];

function serializeTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value === "object" &&
    typeof value.seconds === "number"
  ) {
    return new Date(
      value.seconds * 1000
    ).toISOString();
  }

  return value;
}

function serializeOrder(order) {
  return {
    ...order,
    createdAt: serializeTimestamp(
      order.createdAt
    ),
    updatedAt: serializeTimestamp(
      order.updatedAt
    ),
    paidAt: serializeTimestamp(
      order.paidAt
    ),
  };
}

/*
 * GET ONE ORDER
 */
export async function GET(
  request,
  context
) {
  try {
    const admin =
      await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Admin authentication required.",
        },
        { status: 403 }
      );
    }

    const { orderId } =
      await context.params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const orderSnapshot =
      await adminDb
        .collection("orders")
        .doc(orderId)
        .get();

    if (!orderSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    const order = serializeOrder({
      id: orderSnapshot.id,
      ...orderSnapshot.data(),
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Admin order GET error:",
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

/*
 * UPDATE ORDER STATUS
 */
export async function PATCH(
  request,
  context
) {
  try {
    const admin =
      await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Admin authentication required.",
        },
        { status: 403 }
      );
    }

    const { orderId } =
      await context.params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const body =
      await request.json();

    const status =
      body?.status?.trim();

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order status is required.",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const orderRef =
      adminDb
        .collection("orders")
        .doc(orderId);

    const orderSnapshot =
      await orderRef.get();

    if (!orderSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    await orderRef.update({
      status,
      updatedAt:
        new Date(),
    });

    const updatedSnapshot =
      await orderRef.get();

    const updatedOrder =
      serializeOrder({
        id: updatedSnapshot.id,
        ...updatedSnapshot.data(),
      });

    return NextResponse.json({
      success: true,
      message:
        "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Admin order PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update the order.",
      },
      { status: 500 }
    );
  }
}
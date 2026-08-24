import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import { getCurrentAdmin } from "@/lib/auth/admin-auth";

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

export async function GET(request) {
  try {
    /*
     * ADMIN AUTHENTICATION
     */
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin authentication required.",
        },
        { status: 403 }
      );
    }

    /*
     * Optional filters
     */
    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status");

    const paymentStatus =
      searchParams.get(
        "paymentStatus"
      );

    /*
     * Load orders.
     *
     * We intentionally start with a simple
     * Firestore query so we don't introduce
     * composite-index requirements unnecessarily.
     */
    const snapshot = await adminDb
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    let orders = snapshot.docs.map(
      (doc) =>
        serializeOrder({
          id: doc.id,
          ...doc.data(),
        })
    );

    /*
     * Apply filters in JavaScript.
     *
     * This avoids requiring multiple
     * Firestore composite indexes.
     */
    if (status) {
      orders = orders.filter(
        (order) =>
          order.status === status
      );
    }

    if (paymentStatus) {
      orders = orders.filter(
        (order) =>
          order.paymentStatus ===
          paymentStatus
      );
    }

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error(
      "Admin orders GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load admin orders.",
      },
      { status: 500 }
    );
  }
}
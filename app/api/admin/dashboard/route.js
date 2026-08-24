import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentAdmin } from "@/lib/auth/admin-auth";

function getDateValue(value) {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    typeof value.seconds === "number"
  ) {
    return new Date(value.seconds * 1000);
  }

  if (typeof value === "string") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

function serializeTimestamp(value) {
  const date = getDateValue(value);

  return date ? date.toISOString() : null;
}

export async function GET() {
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
     * LOAD ORDERS
     *
     * We use the existing orders collection.
     */
    const snapshot = await adminDb
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    /*
     * DATE RANGE
     *
     * Use Nigeria/local server date boundaries.
     */
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfToday = new Date(
      startOfToday.getTime() +
        24 * 60 * 60 * 1000
    );

    /*
     * BASIC ORDER COUNTS
     */
    const totalOrders = orders.length;

    const todayOrders = orders.filter(
      (order) => {
        const createdAt =
          getDateValue(order.createdAt);

        return (
          createdAt &&
          createdAt >= startOfToday &&
          createdAt < endOfToday
        );
      }
    );

    const pendingOrders = orders.filter(
      (order) =>
        !order.status ||
        order.status === "pending"
    );

    const processingOrders = orders.filter(
      (order) =>
        order.status === "processing"
    );

    const confirmedOrders = orders.filter(
      (order) =>
        order.status === "confirmed"
    );

    const completedOrders = orders.filter(
      (order) =>
        order.status === "completed"
    );

    const cancelledOrders = orders.filter(
      (order) =>
        order.status === "cancelled"
    );

    /*
     * PAYMENT COUNTS
     */
    const paidOrders = orders.filter(
      (order) =>
        order.paymentStatus === "paid"
    );

    const unpaidOrders = orders.filter(
      (order) =>
        !order.paymentStatus ||
        order.paymentStatus === "unpaid"
    );

    const failedPayments = orders.filter(
      (order) =>
        order.paymentStatus === "failed"
    );

    /*
     * REVENUE
     *
     * Only PAID orders count toward revenue.
     */
    const totalRevenue = paidOrders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );

    const todayRevenue = paidOrders
      .filter((order) => {
        const paidAt =
          getDateValue(
            order.paidAt
          );

        const createdAt =
          getDateValue(
            order.createdAt
          );

        const relevantDate =
          paidAt || createdAt;

        return (
          relevantDate &&
          relevantDate >= startOfToday &&
          relevantDate < endOfToday
        );
      })
      .reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      );

    /*
     * RECENT ORDERS
     */
    const recentOrders = orders
      .slice(0, 10)
      .map((order) => ({
        id: order.id,
        orderNumber:
          order.orderNumber || "",
        status:
          order.status || "pending",
        paymentStatus:
          order.paymentStatus ||
          "unpaid",
        total: Number(
          order.total || 0
        ),
        customer: {
          name:
            order.customer?.name ||
            "Customer",
          email:
            order.customer?.email ||
            "",
          phone:
            order.customer?.phone ||
            "",
        },
        createdAt:
          serializeTimestamp(
            order.createdAt
          ),
      }));

    return NextResponse.json({
      success: true,

      stats: {
        totalOrders,
        todayOrders:
          todayOrders.length,

        totalRevenue,
        todayRevenue,

        pendingOrders:
          pendingOrders.length,

        processingOrders:
          processingOrders.length,

        confirmedOrders:
          confirmedOrders.length,

        completedOrders:
          completedOrders.length,

        cancelledOrders:
          cancelledOrders.length,

        paidOrders:
          paidOrders.length,

        unpaidOrders:
          unpaidOrders.length,

        failedPayments:
          failedPayments.length,
      },

      recentOrders,
    });
  } catch (error) {
    console.error(
      "Admin dashboard GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load dashboard statistics.",
      },
      { status: 500 }
    );
  }
}
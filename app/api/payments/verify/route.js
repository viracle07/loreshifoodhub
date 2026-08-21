import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();

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

    const body = await request.json();

    const reference =
      typeof body?.reference === "string"
        ? body.reference.trim()
        : "";

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "PAYSTACK_SECRET_KEY is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment service is not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * Find the order using the payment
     * reference.
     */
    const snapshot = await adminDb
      .collection("orders")
      .where(
        "paymentReference",
        "==",
        reference
      )
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment order not found.",
        },
        { status: 404 }
      );
    }

    const orderDoc =
      snapshot.docs[0];

    const order =
      orderDoc.data();

    /*
     * Make sure this order belongs
     * to the signed-in customer.
     */
    if (
      order.userId !==
      currentUser.uid
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden.",
        },
        { status: 403 }
      );
    }

    /*
     * Ask Paystack directly for the
     * authoritative transaction status.
     */
    const paystackResponse =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${secretKey}`,
          },
        }
      );

    const paystackData =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData?.status ||
      !paystackData?.data
    ) {
      console.error(
        "Paystack verification failed:",
        paystackData
      );

      return NextResponse.json(
        {
          success: false,
          error:
            paystackData?.message ||
            "Unable to verify payment.",
        },
        { status: 502 }
      );
    }

    const transaction =
      paystackData.data;

    /*
     * Expected amount from our order.
     */
    const expectedAmount =
      Math.round(
        Number(order.total || 0) *
          100
      );

    const paidAmount = Number(
      transaction.amount || 0
    );

    /*
     * Verify:
     *
     * 1. Transaction succeeded
     * 2. Amount matches our order
     * 3. Currency is NGN
     * 4. Reference matches
     */
    const paymentSuccessful =
      transaction.status ===
        "success" &&
      paidAmount ===
        expectedAmount &&
      transaction.currency ===
        "NGN" &&
      transaction.reference ===
        reference;

    if (!paymentSuccessful) {
      await orderDoc.ref.update({
        paymentStatus:
          transaction.status ===
          "failed"
            ? "failed"
            : "unpaid",

        updatedAt:
          FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        {
          success: false,
          paid: false,
          error:
            "Payment could not be verified.",
        },
        { status: 400 }
      );
    }

    /*
     * Payment is genuinely confirmed.
     */
    await orderDoc.ref.update({
      paymentStatus: "paid",

      paymentMethod:
        "online",

      paymentTransactionId:
        transaction.id
          ? String(transaction.id)
          : null,

      paymentChannel:
        transaction.channel ||
        null,

      paidAt:
        FieldValue.serverTimestamp(),

      /*
       * Order moves forward only after
       * verified payment.
       */
      status: "confirmed",

      updatedAt:
        FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,

      paid: true,

      order: {
        id: orderDoc.id,

        orderNumber:
          order.orderNumber || "",

        paymentStatus:
          "paid",

        status:
          "confirmed",

        total:
          Number(order.total || 0),
      },
    });
  } catch (error) {
    console.error(
      "Verify payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}
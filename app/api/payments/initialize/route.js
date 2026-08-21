import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(request) {
  try {
    /*
     * 1. Verify customer
     */
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

    /*
     * 2. Read request
     */
    const body = await request.json();

    const orderId =
      typeof body?.orderId === "string"
        ? body.orderId.trim()
        : "";

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * 3. Load order
     */
    const orderRef = adminDb
      .collection("orders")
      .doc(orderId);

    const orderDoc =
      await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    const order = orderDoc.data();

    /*
     * 4. Make sure the order belongs
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
     * 5. Make sure the order can be paid.
     */
    if (
      order.paymentStatus === "paid"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This order has already been paid.",
        },
        { status: 400 }
      );
    }

    if (
      order.paymentMethod !== "online"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This order is not configured for online payment.",
        },
        { status: 400 }
      );
    }

    /*
     * 6. Validate amount
     */
    const total = Number(
      order.total
    );

    if (
      !Number.isFinite(total) ||
      total <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This order has an invalid payment amount.",
        },
        { status: 400 }
      );
    }

    /*
     * Paystack expects the amount
     * in the smallest currency unit.
     *
     * NGN:
     * ₦1 = 100 kobo
     */
    const amountInKobo =
      Math.round(total * 100);

    /*
     * 7. Require Paystack secret key
     */
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
     * 8. Create a unique payment reference
     */
    const reference =
      `LORESHI-${orderId}-${Date.now()}`;

    /*
     * 9. Determine callback URL
     */
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(
        request.url
      ).origin;

    const callbackUrl =
      `${siteUrl}/payment/callback`;

    /*
     * 10. Initialize Paystack transaction
     */
    const paystackResponse =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${secretKey}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              order.customer?.email ||
              currentUser.email,

            amount:
              String(amountInKobo),

            currency: "NGN",

            reference,

            callback_url:
              callbackUrl,

            metadata: {
              orderId,
              orderNumber:
                order.orderNumber ||
                "",
              userId:
                currentUser.uid,
            },
          }),
        }
      );

    const paystackData =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData?.status ||
      !paystackData?.data
        ?.authorization_url
    ) {
      console.error(
        "Paystack initialization failed:",
        paystackData
      );

      return NextResponse.json(
        {
          success: false,
          error:
            paystackData?.message ||
            "Unable to initialize payment.",
        },
        { status: 502 }
      );
    }

    const {
      authorization_url:
        authorizationUrl,
      access_code: accessCode,
    } = paystackData.data;

    /*
     * 11. Store payment attempt
     *
     * We DO NOT mark the order as paid.
     */
    await orderRef.update({
      paymentReference:
        reference,

      paymentAccessCode:
        accessCode || null,

      paymentStatus:
        "processing",

      updatedAt:
        new Date(),
    });

    /*
     * 12. Return checkout URL
     */
    return NextResponse.json({
      success: true,

      payment: {
        authorizationUrl,
        reference,
      },
    });
  } catch (error) {
    console.error(
      "Initialize payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to initialize payment.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";

function cleanString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(request) {
  try {
    /*
     * 1. Verify authenticated customer
     */
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    /*
     * 2. Read request body
     */
    const body = await request.json();

    const customer = body?.customer || {};
    const delivery = body?.delivery || {};
    const submittedItems =
      Array.isArray(body?.items)
        ? body.items
        : [];

    /*
     * 3. Validate customer information
     */
    const name = cleanString(
      customer.name
    );

    const phone = cleanString(
      customer.phone
    );

    const email = cleanString(
      customer.email
    );

   const address = cleanString(
  delivery.address
);

const city = cleanString(
  delivery.city
);

const state = cleanString(
  delivery.state
);

const notes = cleanString(
  delivery.notes
);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name is required.",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email address is required.",
        },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Delivery address is required.",
        },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error: "City is required.",
        },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json(
        {
          success: false,
          error: "State is required.",
        },
        { status: 400 }
      );
    }

    /*
     * 4. Validate cart
     */
    if (!submittedItems.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    /*
     * 5. Re-read products from Firestore
     *
     * NEVER trust product prices sent
     * from the browser.
     */
    const verifiedItems = [];

    for (const submittedItem of submittedItems) {
      const productId =
        cleanString(
          submittedItem?.productId
        );

      const variantId =
        cleanString(
          submittedItem?.variantId
        );

      const quantity = Number(
        submittedItem?.quantity
      );

      if (!productId || !variantId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid product information.",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid product quantity.",
          },
          { status: 400 }
        );
      }

      const productRef = adminDb
        .collection("products")
        .doc(productId);

      const productDoc =
        await productRef.get();

      if (!productDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error:
              "One of the products in your cart no longer exists.",
          },
          { status: 400 }
        );
      }

      const product =
        productDoc.data();

      /*
       * Product must still be active.
       */
      if (product.active === false) {
        return NextResponse.json(
          {
            success: false,
            error: `${product.name || "A product"} is no longer available.`,
          },
          { status: 400 }
        );
      }

      /*
       * Product must still be in stock.
       */
      if (
        product.stockStatus !==
        "in_stock"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `${product.name || "A product"} is currently out of stock.`,
          },
          { status: 400 }
        );
      }

      /*
       * Find the authoritative variant.
       */
      const variants = Array.isArray(
        product.variants
      )
        ? product.variants
        : [];

      const variant = variants.find(
        (item) =>
          item?.id === variantId &&
          item?.active !== false
      );

      if (!variant) {
        return NextResponse.json(
          {
            success: false,
            error: `${product.name || "A product"} has changed. Please review your cart.`,
          },
          { status: 400 }
        );
      }

      const price = Number(
        variant.price
      );

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A product in your cart has an invalid price.",
          },
          { status: 400 }
        );
      }

      /*
       * Use Firestore values for the order.
       */
      verifiedItems.push({
        productId,
        productName:
          product.name || "",
        productSlug:
          product.slug || "",
        productImage:
          product.images?.[0]?.url || "",
        categoryId:
          product.categoryId || "",
        categoryName:
          product.categoryName || "",
        variantId,
        variantLabel:
          variant.label || "",
        packageSize:
          variant.packageSize ?? null,
        packageUnit:
          variant.packageUnit || "",
        price,
        quantity,
        lineTotal:
          price * quantity,
      });
    }

    /*
     * 6. Calculate authoritative totals
     */
    const subtotal = verifiedItems.reduce(
      (total, item) =>
        total + item.lineTotal,
      0
    );

    /*
     * Delivery fee will be calculated later.
     */
    const deliveryFee = 0;

    const total =
      subtotal + deliveryFee;

    /*
     * 7. Generate order number
     *
     * Example:
     * LFS-20260820-XXXX
     */
    const orderRef = adminDb
      .collection("orders")
      .doc();

    const orderNumber = `LFS-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${orderRef.id
      .slice(0, 6)
      .toUpperCase()}`;

    /*
     * 8. Save order
     */
    await orderRef.set({
      orderNumber,

      userId: currentUser.uid,

      customer: {
        name,
        phone,
        email,
      },

      delivery: {
        address,
        city,
        state,
        notes,
      },

      items: verifiedItems,

      subtotal,
      deliveryFee,
      total,

      status: "pending",

      paymentStatus: "unpaid",

      paymentMethod: null,

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    });

    /*
     * 9. Return safe response
     */
    return NextResponse.json(
      {
        success: true,
        order: {
          id: orderRef.id,
          orderNumber,
          subtotal,
          deliveryFee,
          total,
          status: "pending",
          paymentStatus: "unpaid",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create your order.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    const snapshot = await adminDb
      .collection("orders")
      .where(
        "userId",
        "==",
        currentUser.uid
      )
      .orderBy(
        "createdAt",
        "desc"
      )
      .get();

    const orders = snapshot.docs.map(
      (doc) => {
        const data = doc.data();

        return {
          id: doc.id,
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
      }
    );

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Get customer orders error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load your orders.",
      },
      { status: 500 }
    );
  }
}
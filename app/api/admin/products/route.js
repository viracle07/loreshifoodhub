import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { createProductSlug } from "@/lib/products/product-utils";
import { validateProductInput } from "@/lib/products/product-validation";
import { getCurrentAdmin } from "@/lib/auth/admin-auth";

export async function GET() {
  try {
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

    const snapshot = await adminDb
      .collection("products")
      .orderBy("sortOrder", "asc")
      .get();

    const products = snapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "Admin get products error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load admin products.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
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

    const body = await request.json();

    const validation =
      validateProductInput(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid product information.",
          fields: validation.errors,
        },
        { status: 400 }
      );
    }

    const name =
      body.name.trim();

    const description =
      body.description.trim();

    const slug =
      createProductSlug(name);

    /*
     * Prevent duplicate product slugs.
     */
    const existing =
      await adminDb
        .collection("products")
        .where("slug", "==", slug)
        .limit(1)
        .get();

    if (!existing.empty) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A product with this name already exists.",
        },
        { status: 409 }
      );
    }

    /*
     * Create a new Firestore document.
     */
    const productRef =
      adminDb
        .collection("products")
        .doc();

    const variants =
      Array.isArray(body.variants)
        ? body.variants.map(
            (variant, index) => ({
              id:
                variant.id?.trim() ||
                `${slug}-${index + 1}`,

              label:
                variant.label.trim(),

              price:
                Number(
                  variant.price
                ),

              packageSize:
                variant.packageSize ??
                null,

              packageUnit:
                variant.packageUnit ??
                null,

              active:
                variant.active !==
                false,
            })
          )
        : [];

    const productData = {
      name,

      slug,

      description,

      categoryId:
        body.categoryId.trim(),

      categoryName:
        body.categoryName?.trim() ||
        "",

      images:
        Array.isArray(body.images)
          ? body.images
          : [],

      variants,

      active:
        body.active !== false,

      stockStatus:
        body.stockStatus ||
        "in_stock",

      isNew:
        body.isNew === true,

      isHot:
        body.isHot === true,

      featured:
        body.featured === true,

      sortOrder:
        Number.isFinite(
          body.sortOrder
        )
          ? body.sortOrder
          : 0,

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    };

    await productRef.set(
      productData
    );

    return NextResponse.json(
      {
        success: true,

        product: {
          id: productRef.id,
          ...productData,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin create product error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create product.",
      },
      { status: 500 }
    );
  }
}
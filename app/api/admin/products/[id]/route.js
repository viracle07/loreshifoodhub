import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { createProductSlug } from "@/lib/products/product-utils";
import { validateProductInput } from "@/lib/products/product-validation";
import { getCurrentAdmin } from "@/lib/auth/admin-auth";

/*
 * GET SINGLE PRODUCT
 */
export async function GET(
  request,
  { params }
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const productRef =
      adminDb
        .collection("products")
        .doc(id);

    const productSnapshot =
      await productRef.get();

    if (!productSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: {
        id: productSnapshot.id,
        ...productSnapshot.data(),
      },
    });
  } catch (error) {
    console.error(
      "Admin get product error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load product.",
      },
      { status: 500 }
    );
  }
}

/*
 * UPDATE PRODUCT
 */
export async function PUT(
  request,
  { params }
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const productRef =
      adminDb
        .collection("products")
        .doc(id);

    const existingProduct =
      await productRef.get();

    if (!existingProduct.exists) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    const body =
      await request.json();

    /*
     * Validate the same product
     * structure used during creation.
     */
    const validation =
      validateProductInput(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid product information.",
          fields:
            validation.errors,
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
     * Prevent another product from
     * using the same slug.
     */
    const duplicateSnapshot =
      await adminDb
        .collection("products")
        .where("slug", "==", slug)
        .limit(2)
        .get();

    const duplicateProduct =
      duplicateSnapshot.docs.find(
        (doc) => doc.id !== id
      );

    if (duplicateProduct) {
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
     * Normalize variants.
     */
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
                variant.packageUnit
                  ?.trim() ||
                null,

              active:
                variant.active !==
                false,
            })
          )
        : [];

    /*
     * Normalize images.
     */
    const images =
      Array.isArray(body.images)
        ? body.images
            .filter(
              (image) =>
                image &&
                typeof image.url ===
                  "string" &&
                image.url.trim()
            )
            .map((image) => ({
              url:
                image.url.trim(),

              alt:
                image.alt?.trim() ||
                "",
            }))
        : [];

    /*
     * Data that can be edited.
     *
     * We intentionally preserve
     * createdAt.
     */
    const updateData = {
      name,

      slug,

      description,

      categoryId:
        body.categoryId.trim(),

      categoryName:
        body.categoryName?.trim() ||
        "",

      images,

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

      updatedAt:
        FieldValue.serverTimestamp(),
    };

    await productRef.update(
      updateData
    );

    return NextResponse.json({
      success: true,

      product: {
        id,
        ...updateData,
      },
    });
  } catch (error) {
    console.error(
      "Admin update product error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update product.",
      },
      { status: 500 }
    );
  }
}

/*
 * DELETE PRODUCT
 *
 * We don't immediately delete the
 * Firestore document.
 *
 * Instead, we deactivate it.
 *
 * This is safer because an existing
 * product may already be referenced
 * by customer orders.
 */
export async function DELETE(
  request,
  { params }
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const productRef =
      adminDb
        .collection("products")
        .doc(id);

    const existingProduct =
      await productRef.get();

    if (!existingProduct.exists) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    await productRef.update({
      active: false,
      updatedAt:
        FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message:
        "Product deactivated successfully.",
    });
  } catch (error) {
    console.error(
      "Admin deactivate product error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to deactivate product.",
      },
      { status: 500 }
    );
  }
}
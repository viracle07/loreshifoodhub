import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { createProductSlug } from "@/lib/products/product-utils";
import { validateProductInput } from "@/lib/products/product-validation";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("category");
    const newOnly = searchParams.get("new") === "true";
    const hotOnly = searchParams.get("hot") === "true";
    const featuredOnly =
      searchParams.get("featured") === "true";

    let query = adminDb
      .collection("products")
      .where("active", "==", true);

    if (categoryId) {
      query = query.where(
        "categoryId",
        "==",
        categoryId
      );
    }

    if (newOnly) {
      query = query.where("isNew", "==", true);
    }

    if (hotOnly) {
      query = query.where("isHot", "==", true);
    }

    if (featuredOnly) {
      query = query.where(
        "featured",
        "==",
        true
      );
    }

    const snapshot = await query
      .orderBy("sortOrder", "asc")
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load products.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validation = validateProductInput(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product information.",
          fields: validation.errors,
        },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    const description = body.description.trim();

    const slug = createProductSlug(name);

    const existing = await adminDb
      .collection("products")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "A product with this name already exists.",
        },
        { status: 409 }
      );
    }

    const productRef = adminDb
      .collection("products")
      .doc();

    const productData = {
      name,
      slug,
      description,

      categoryId: body.categoryId.trim(),
      categoryName: body.categoryName?.trim() || "",

      images: Array.isArray(body.images)
        ? body.images
        : [],

      variants: body.variants.map((variant, index) => ({
        id:
          variant.id?.trim() ||
          `${slug}-${index + 1}`,

        label: variant.label.trim(),

        price: variant.price,

        packageSize:
          variant.packageSize ??
          null,

        packageUnit:
          variant.packageUnit ??
          null,

        active:
          variant.active !== false,
      })),

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
        Number.isFinite(body.sortOrder)
          ? body.sortOrder
          : 0,

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    };

    await productRef.set(productData);

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
    console.error("Create product error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create product.",
      },
      { status: 500 }
    );
  }
}
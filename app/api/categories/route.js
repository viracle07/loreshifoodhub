import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { createCategorySlug } from "@/lib/products/category-utils";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("categories")
      .where("active", "==", true)
      .orderBy("sortOrder", "asc")
      .get();

    const categories = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() ??
          null,
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString() ??
          null,
      };
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(
      "Get categories error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load categories.",
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

    const name = body?.name?.trim();

    const description =
      body?.description?.trim() || "";

    const imageUrl =
      body?.imageUrl?.trim() || "";

    const requestedId =
      body?.id?.trim() || "";

    const sortOrder = Number.isFinite(
      body?.sortOrder
    )
      ? body.sortOrder
      : 0;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required.",
        },
        { status: 400 }
      );
    }

    const slug = createCategorySlug(name);

    /*
     * Prevent duplicate category slugs.
     */
    const existing = await adminDb
      .collection("categories")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A category with this name already exists.",
        },
        { status: 409 }
      );
    }

    /*
     * Use the supplied ID when provided.
     *
     * This allows our existing product categoryId
     * values such as "grains" and "fish-seafood"
     * to match the category documents.
     *
     * If no ID is supplied, Firestore generates one.
     */
    const categoryRef = requestedId
      ? adminDb
          .collection("categories")
          .doc(requestedId)
      : adminDb
          .collection("categories")
          .doc();

    /*
     * Prevent duplicate document IDs.
     */
    const existingId =
      await categoryRef.get();

    if (existingId.exists) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A category with this ID already exists.",
        },
        { status: 409 }
      );
    }

    await categoryRef.set({
      name,
      slug,
      description,
      imageUrl,
      active: true,
      sortOrder,
      createdAt:
        FieldValue.serverTimestamp(),
      updatedAt:
        FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        category: {
          id: categoryRef.id,
          name,
          slug,
          description,
          imageUrl,
          active: true,
          sortOrder,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create category error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create category.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { createCategorySlug } from "@/lib/products/category-utils";
import { getCurrentAdmin } from "@/lib/auth/admin-auth";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("categories")
      .where("active", "==", true)
      .orderBy("sortOrder", "asc")
      .get();

    const categories = snapshot.docs.map(
      (doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,

          createdAt:
            data.createdAt
              ?.toDate?.()
              ?.toISOString() ?? null,

          updatedAt:
            data.updatedAt
              ?.toDate?.()
              ?.toISOString() ?? null,
        };
      }
    );

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
        error:
          "Unable to load categories.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    /*
     * ADMIN AUTHENTICATION
     */
    const currentAdmin =
      await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Admin authentication required.",
        },
        { status: 403 }
      );
    }

    /*
     * REQUEST BODY
     */
    const body =
      await request.json();

    const name =
      body?.name?.trim();

    const requestedId =
      body?.id?.trim() || "";

    const sortOrder =
      Number.isFinite(
        body?.sortOrder
      )
        ? Number(body.sortOrder)
        : 0;

    /*
     * VALIDATION
     */
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Category name is required.",
        },
        { status: 400 }
      );
    }

    /*
     * CREATE SLUG
     */
    const slug =
      createCategorySlug(name);

    /*
     * PREVENT DUPLICATE SLUGS
     */
    const existing =
      await adminDb
        .collection("categories")
        .where(
          "slug",
          "==",
          slug
        )
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
     * CATEGORY DOCUMENT
     *
     * If an ID is supplied, use it.
     * Otherwise Firestore generates one.
     */
    const categoryRef =
      requestedId
        ? adminDb
            .collection(
              "categories"
            )
            .doc(requestedId)
        : adminDb
            .collection(
              "categories"
            )
            .doc();

    /*
     * PREVENT DUPLICATE IDs
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

    /*
     * CREATE CATEGORY
     */
    await categoryRef.set({
      name,
      slug,

      active: true,

      sortOrder,

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    });

    /*
     * RESPONSE
     */
    return NextResponse.json(
      {
        success: true,

        category: {
          id: categoryRef.id,
          name,
          slug,
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
        error:
          "Unable to create category.",
      },
      { status: 500 }
    );
  }
}
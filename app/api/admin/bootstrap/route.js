import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = body?.email?.trim();
    const name = body?.name?.trim();
    const password = body?.password;
    const secret = body?.secret?.trim();

    if (
      !email ||
      !name ||
      !password ||
      !secret
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name, email, password and bootstrap secret are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Admin password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const bootstrapSecret =
      process.env.ADMIN_BOOTSTRAP_SECRET;

    if (
      !bootstrapSecret ||
      secret !== bootstrapSecret
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid bootstrap credentials.",
        },
        { status: 403 }
      );
    }

    /*
     * Only the first administrator can be
     * created through this endpoint.
     */
    const existingAdminSnapshot =
      await adminDb
        .collection("users")
        .where("role", "==", "admin")
        .limit(1)
        .get();

    if (!existingAdminSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An administrator already exists. Bootstrap is no longer available.",
        },
        { status: 409 }
      );
    }

    let firebaseUser;

    try {
      firebaseUser =
        await adminAuth.getUserByEmail(
          email
        );

      /*
       * Existing Firebase user:
       * give the account an email/password
       * login credential and update its name.
       */
      firebaseUser =
        await adminAuth.updateUser(
          firebaseUser.uid,
          {
            displayName: name,
            password,
          }
        );
    } catch (error) {
      if (
        error?.code ===
        "auth/user-not-found"
      ) {
        firebaseUser =
          await adminAuth.createUser({
            email,
            password,
            displayName: name,
            emailVerified: false,
          });
      } else {
        throw error;
      }
    }

    const userRef = adminDb
      .collection("users")
      .doc(firebaseUser.uid);

    await userRef.set(
      {
        uid: firebaseUser.uid,
        name,
        email:
          firebaseUser.email || email,
        photoURL:
          firebaseUser.photoURL || "",
        emailVerified:
          firebaseUser.emailVerified ||
          false,

        role: "admin",
        active: true,

        createdAt:
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),

        lastLoginAt: null,
      },
      {
        merge: true,
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "First administrator created successfully.",
      user: {
        uid: firebaseUser.uid,
        name,
        email:
          firebaseUser.email || email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error(
      "Admin bootstrap error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create the first administrator.",
      },
      { status: 500 }
    );
  }
}
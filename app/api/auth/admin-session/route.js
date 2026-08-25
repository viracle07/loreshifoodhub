import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminAuth, adminDb } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME =
  "loreshi_session";

const ADMIN_SESSION_DURATION =
  1000 * 60 * 60 * 2;

export async function POST(request) {
  try {
    const body = await request.json();

    const idToken = body?.idToken;

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authentication token is required.",
        },
        { status: 400 }
      );
    }

    /*
     * 1. Verify Firebase authentication.
     */
    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    /*
     * 2. Load the user's Firestore profile.
     */
    const userRef = adminDb
      .collection("users")
      .doc(decodedToken.uid);

    const userSnapshot =
      await userRef.get();

    if (!userSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Administrator account not found.",
        },
        { status: 403 }
      );
    }

    const user =
      userSnapshot.data();

    /*
     * 3. Verify administrator role.
     */
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error:
            "You are not authorized to access the administration panel.",
        },
        { status: 403 }
      );
    }

    /*
     * 4. Verify administrator is active.
     */
    if (user.active === false) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This administrator account is inactive.",
        },
        { status: 403 }
      );
    }

    /*
     * 5. Create a dedicated 2-hour
     * server-side session.
     */
    const sessionCookie =
      await adminAuth.createSessionCookie(
        idToken,
        {
          expiresIn:
            ADMIN_SESSION_DURATION,
        }
      );

    /*
     * 6. Record administrator login.
     */
    await userRef.set(
      {
        lastLoginAt:
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    /*
     * 7. Create response.
     */
    const response =
      NextResponse.json({
        success: true,

        user: {
          uid: decodedToken.uid,

          name:
            user.name ||
            decodedToken.name ||
            "",

          email:
            user.email ||
            decodedToken.email ||
            "",

          photoURL:
            user.photoURL ||
            decodedToken.picture ||
            "",

          role: "admin",
        },
      });

    /*
     * 8. Store secure HTTP-only session cookie.
     */
    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionCookie,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        maxAge:
          ADMIN_SESSION_DURATION / 1000,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Admin session creation failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create administrator session.",
      },
      { status: 401 }
    );
  }
}
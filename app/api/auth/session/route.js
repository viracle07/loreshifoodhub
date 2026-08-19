import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminAuth, adminDb } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "loreshi_session";

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 5;

export async function POST(request) {
  try {
    const body = await request.json();
    const idToken = body?.idToken;

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication token is required.",
        },
        { status: 400 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const userRef = adminDb
      .collection("users")
      .doc(decodedToken.uid);

    await userRef.set(
      {
        uid: decodedToken.uid,
        name: decodedToken.name || "",
        email: decodedToken.email || "",
        photoURL: decodedToken.picture || "",
        emailVerified: decodedToken.email_verified === true,
        lastLoginAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    const sessionCookie = await adminAuth.createSessionCookie(
      idToken,
      {
        expiresIn: SESSION_DURATION,
      }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        name: decodedToken.name || "",
        email: decodedToken.email || "",
        photoURL: decodedToken.picture || "",
      },
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionCookie,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION / 1000,
      }
    );

    return response;
  } catch (error) {
    console.error("Session creation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create authenticated session.",
      },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set(
    SESSION_COOKIE_NAME,
    "",
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );

  return response;
}
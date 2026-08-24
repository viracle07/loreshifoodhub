import "server-only";

import { cookies } from "next/headers";

import { adminAuth, adminDb } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "loreshi_session";

export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();

    const sessionCookie =
      cookieStore.get(
        SESSION_COOKIE_NAME
      )?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims =
      await adminAuth.verifySessionCookie(
        sessionCookie,
        true
      );

    const userSnapshot =
      await adminDb
        .collection("users")
        .doc(decodedClaims.uid)
        .get();

    if (!userSnapshot.exists) {
      return null;
    }

    const user =
      userSnapshot.data();

    if (user.role !== "admin") {
      return null;
    }

    if (user.active === false) {
      return null;
    }

    return {
      uid: decodedClaims.uid,
      email:
        user.email ||
        decodedClaims.email ||
        "",
      name:
        user.name ||
        decodedClaims.name ||
        "",
      photoURL:
        user.photoURL ||
        decodedClaims.picture ||
        "",
      role: user.role,
      active: user.active !== false,
    };
  } catch (error) {
    console.error(
      "Admin authentication check failed:",
      error
    );

    return null;
  }
}

export async function requireAdmin() {
  const admin =
    await getCurrentAdmin();

  if (!admin) {
    throw new Error(
      "ADMIN_UNAUTHORIZED"
    );
  }

  return admin;
}
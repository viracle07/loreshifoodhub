import "server-only";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "loreshi_session";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get(
      SESSION_COOKIE_NAME
    )?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    return decodedClaims;
  } catch (error) {
    console.error("Session verification failed:", error);

    return null;
  }
}
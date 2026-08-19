import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase/client";

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);

  const user = result.user;

  const idToken = await user.getIdToken();

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to create authenticated session."
    );
  }

  return user;
}

export async function signOutUser() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  }).catch(() => {});

  await signOut(auth);
}
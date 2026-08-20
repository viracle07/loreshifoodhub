"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  signInWithGoogle,
  signOutUser,
} from "@/lib/auth/auth-client";

import { useAuth } from "@/app/context/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, loading } = useAuth();

  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const redirectTo =
    searchParams.get("redirect") || "/";

  async function handleGoogleSignIn() {
    try {
      setError("");
      setSigningIn(true);

      await signInWithGoogle();

      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Google sign-in failed:", error);

      setError(
        error?.message ||
          "Unable to sign in with Google."
      );
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    try {
      setError("");
      setSigningOut(true);

      await signOutUser();

      router.replace("/auth");
      router.refresh();
    } catch (error) {
      console.error("Sign-out failed:", error);

      setError(
        error?.message ||
          "Unable to sign out."
      );
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDF8] px-5">
        <p className="text-sm text-gray-600">
          Checking your account...
        </p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDF8] px-5 py-12">
        <section className="w-full max-w-md rounded-3xl border border-[#E7E4DC] bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#68912B]">
              Loreshi FoodHub
            </p>

            <h1 className="mt-3 text-2xl font-bold text-[#1F1F1F]">
              You're signed in
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              You're currently signed in with:
            </p>

            <p className="mt-2 break-all text-sm font-semibold text-[#1F1F1F]">
              {user.email}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => {
                router.replace(redirectTo);
                router.refresh();
              }}
              className="w-full rounded-xl bg-[#B22625] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#8F1D1D]"
            >
              Continue to Loreshi
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full rounded-xl border border-[#E7E4DC] bg-white px-5 py-3.5 text-sm font-semibold text-[#B22625] transition hover:bg-[#F9E5E5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signingOut
                ? "Signing out..."
                : "Sign Out"}
            </button>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl bg-[#F9E5E5] p-4 text-sm leading-6 text-[#8F1D1D]">
              {error}
            </div>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFDF8] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#E7E4DC] bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#68912B]">
            Loreshi FoodHub
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1F1F1F]">
            Welcome to Loreshi
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Sign in to add products to your cart,
            checkout and manage your orders.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="mt-8 flex w-full items-center justify-center rounded-xl bg-[#B22625] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#8F1D1D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingIn
            ? "Signing in..."
            : "Continue with Google"}
        </button>

        {error ? (
          <div className="mt-5 rounded-xl bg-[#F9E5E5] p-4 text-sm leading-6 text-[#8F1D1D]">
            {error}
          </div>
        ) : null}
      </section>
    </main>
  );
}
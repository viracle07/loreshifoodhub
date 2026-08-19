"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { signInWithGoogle } from "@/lib/auth/auth-client";
import { useAuth } from "@/app/context/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, loading } = useAuth();

  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [loading, user, redirectTo, router]);

  async function handleGoogleSignIn() {
    try {
      setError("");
      setSigningIn(true);

      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed:", error);

      setError(
        error?.message || "Unable to sign in with Google."
      );
    } finally {
      setSigningIn(false);
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
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDF8] px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#E7E4DC] border-t-[#B22625]" />

          <p className="text-sm text-gray-600">
            Redirecting...
          </p>
        </div>
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
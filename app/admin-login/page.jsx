"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * Sign in through Firebase Auth.
       */
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      /*
       * Get the Firebase ID token.
       */
      const idToken =
        await credential.user.getIdToken(
          true
        );

      /*
       * Create the secure server session.
       */
      const response = await fetch(
        "/api/auth/admin-session",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            idToken,
          }),
        }
      );

      const responseText =
  await response.text();

console.log(
  "SESSION STATUS:",
  response.status
);

console.log(
  "SESSION RESPONSE:",
  responseText
);

let data;

try {
  data = JSON.parse(responseText);
} catch {
  throw new Error(
    "The server returned an invalid response."
  );
}

if (
  !response.ok ||
  !data.success
) {
  throw new Error(
    data.error ||
      "Unable to create admin session."
  );
}

      /*
       * IMPORTANT:
       *
       * The session route currently creates
       * the session for any authenticated user.
       *
       * The admin dashboard will perform the
       * server-side role check.
       */
      router.replace(
        "/dashboard/admin"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      let message =
        "Unable to sign in.";

      switch (error?.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          message =
            "Invalid email or password.";
          break;

        case "auth/too-many-requests":
          message =
            "Too many login attempts. Please try again later.";
          break;

        case "auth/invalid-email":
          message =
            "Please enter a valid email address.";
          break;

        default:
          message =
            error?.message || message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-5 py-12">
        <div className="w-full">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B22625]">
              Loreshi FoodHub
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1F1F1F]">
              Admin Login
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Sign in to access the administration
              panel.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-3xl border border-[#E7E4DC] bg-white p-6 shadow-sm sm:p-8"
          >
            {error ? (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-[#1F1F1F]"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
                placeholder="admin@example.com"
                className="mt-2 h-12 w-full rounded-xl border border-[#E7E4DC] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4]"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-[#1F1F1F]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                placeholder="Enter your password"
                className="mt-2 h-12 w-full rounded-xl border border-[#E7E4DC] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 h-12 w-full rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
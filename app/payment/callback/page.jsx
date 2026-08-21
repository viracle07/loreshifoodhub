"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

function PaymentCallbackContent() {
    const { clearCart } = useCart();
  const searchParams = useSearchParams();

  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref");

  const [status, setStatus] =
    useState("verifying");

  const [message, setMessage] =
    useState("");

  const [orderNumber, setOrderNumber] =
    useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage(
        "No payment reference was provided."
      );
      return;
    }

    let cancelled = false;

    async function verifyPayment() {
      try {
        const response = await fetch(
          "/api/payments/verify",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              reference,
            }),
          }
        );

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        if (
          !response.ok ||
          !data.success ||
          !data.paid
        ) {
          throw new Error(
            data.error ||
              "Payment could not be verified."
          );
        }

        setOrderNumber(
  data.order?.orderNumber || ""
);

clearCart();

setStatus("success");
      } catch (error) {
        console.error(
          "Payment verification error:",
          error
        );

        if (!cancelled) {
          setStatus("failed");
          setMessage(
            error.message ||
              "We could not verify your payment."
          );
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (status === "verifying") {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF4E4]">
            <Loader2
              size={40}
              className="animate-spin text-[#68912B]"
            />
          </div>

          <h1 className="mt-7 text-3xl font-bold text-[#1F1F1F]">
            Verifying your payment
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Please wait while we securely confirm
            your payment. Do not close this page.
          </p>
        </div>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF4E4]">
            <CheckCircle2
              size={42}
              className="text-[#68912B]"
            />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#68912B]">
            Payment Successful
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
            Your payment was confirmed
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            Thank you. Your order has been confirmed
            and we're now processing it.
          </p>

          {orderNumber ? (
            <div className="mt-7 rounded-2xl border border-[#E7E4DC] bg-white px-7 py-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                Order Number
              </p>

              <p className="mt-2 text-xl font-bold tracking-wide text-[#B22625]">
                {orderNumber}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            {orderNumber ? (
              <Link
                href="/account/orders"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
              >
                View My Orders
                <ArrowRight size={17} />
              </Link>
            ) : null}

            <Link
              href="/products"
              className="flex h-12 items-center justify-center rounded-xl border border-[#E7E4DC] bg-white px-5 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F5F3EC]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0F0]">
          <XCircle
            size={42}
            className="text-[#B22625]"
          />
        </div>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
          Payment Not Confirmed
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F]">
          We couldn't confirm your payment
        </h1>

        <p className="mt-4 text-sm leading-7 text-gray-600">
          {message ||
            "Your payment could not be verified. If money was deducted from your account, please contact us before attempting another payment."}
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <Link
            href="/account/orders"
            className="flex h-12 items-center justify-center rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white"
          >
            View My Orders
          </Link>

          <Link
            href="/"
            className="flex h-12 items-center justify-center rounded-xl border border-[#E7E4DC] bg-white px-5 text-sm font-semibold text-[#1F1F1F]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function PaymentCallbackFallback() {
  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="flex min-h-[75vh] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-[#68912B]"
        />
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <PaymentCallbackFallback />
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
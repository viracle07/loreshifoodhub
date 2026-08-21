"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber =
    searchParams.get("order");

  const { clearCart } = useCart();

  /*
   * The order has already been created
   * successfully by the server.
   *
   * Clear this user's cart now.
   */
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center sm:px-6">

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF4E4]">
          <CheckCircle2
            size={42}
            className="text-[#68912B]"
          />
        </div>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#68912B]">
          Order Received
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
          Thank you for your order!
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-7 text-gray-600 sm:text-base">
          Your order has been received successfully.
          We'll review your order and contact you
          with the next steps for delivery and payment.
        </p>

        {orderNumber ? (
          <div className="mt-7 rounded-2xl border border-[#E7E4DC] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              Order Number
            </p>

            <p className="mt-2 text-xl font-bold tracking-wide text-[#B22625]">
              {orderNumber}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <Link
            href="/products"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
          >
            Continue Shopping
            <ArrowRight size={17} />
          </Link>

          <Link
            href="/"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E7E4DC] bg-white px-5 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F5F3EC]"
          >
            <ShoppingBag size={17} />
            Home
          </Link>
        </div>

        <p className="mt-7 text-xs leading-5 text-gray-500">
          Keep your order number for reference when
          contacting Loreshi FoodHub about your order.
        </p>
      </div>
    </main>
  );
}

function OrderSuccessFallback() {
  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="flex min-h-[75vh] items-center justify-center px-5">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E7E4DC] border-t-[#B22625]" />
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={<OrderSuccessFallback />}
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
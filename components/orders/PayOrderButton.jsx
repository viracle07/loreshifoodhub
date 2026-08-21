"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

export default function PayOrderButton({
  orderId,
  onError,
}) {
  const [loading, setLoading] =
    useState(false);

  async function handlePay() {
    try {
      setLoading(true);

      if (!orderId) {
        throw new Error(
          "Order ID is missing."
        );
      }

      const response = await fetch(
        "/api/payments/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.payment
          ?.authorizationUrl
      ) {
        throw new Error(
          data.error ||
            "Unable to initialize payment."
        );
      }

      window.location.href =
        data.payment.authorizationUrl;
    } catch (error) {
      console.error(
        "Retry payment error:",
        error
      );

      onError?.(
        error.message ||
          "Unable to start payment."
      );

      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2
            size={16}
            className="animate-spin"
          />
          Starting Payment...
        </>
      ) : (
        <>
          <CreditCard size={16} />
          Pay Now
        </>
      )}
    </button>
  );
}
"use client";

import PayOrderButton from "@/components/orders/PayOrderButton";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  CreditCard,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString(
    "en-NG"
  )}`;
}

function formatDate(date) {
  if (!date) {
    return "Date unavailable";
  }

  try {
    return new Date(date).toLocaleString(
      "en-NG",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  } catch {
    return "Date unavailable";
  }
}

function statusClass(status) {
  switch (status) {
    case "completed":
      return "bg-[#EDF4E4] text-[#68912B]";

    case "cancelled":
      return "bg-[#FFF0F0] text-[#B22625]";

    case "confirmed":
    case "processing":
      return "bg-[#FFF7E6] text-[#A66A00]";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

function paymentClass(status) {
  switch (status) {
    case "paid":
      return "bg-[#EDF4E4] text-[#68912B]";

    case "failed":
      return "bg-[#FFF0F0] text-[#B22625]";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function OrderDetailsPage({
  params,
}) {
  const { user, loading: authLoading } =
    useAuth();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadOrder() {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { orderId } = await params;

      const response = await fetch(
        `/api/orders/${encodeURIComponent(
          orderId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Unable to load this order."
        );
      }

      setOrder(data.order);
    } catch (error) {
      console.error(
        "Load order details error:",
        error
      );

      setError(
        error.message ||
          "Unable to load this order."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    loadOrder();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="h-5 w-28 animate-pulse rounded bg-[#F0EEE7]" />

          <div className="mt-8 h-40 animate-pulse rounded-3xl bg-[#F0EEE7]" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="h-96 animate-pulse rounded-3xl bg-[#F0EEE7]" />
            <div className="h-80 animate-pulse rounded-3xl bg-[#F0EEE7]" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF4E4]">
            <Package
              size={36}
              className="text-[#68912B]"
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#1F1F1F]">
            Sign in required
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            Please sign in to view your order.
          </p>

          <Link
            href="/auth"
            className="mt-7 flex h-12 items-center justify-center rounded-xl bg-[#B22625] px-7 text-sm font-bold text-white"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0F0]">
            <Package
              size={36}
              className="text-[#B22625]"
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#1F1F1F]">
            Unable to load order
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            {error}
          </p>

          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={loadOrder}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white"
            >
              <RefreshCw size={15} />
              Try Again
            </button>

            <Link
              href="/account/orders"
              className="flex h-11 items-center rounded-xl border border-[#E7E4DC] bg-white px-5 text-sm font-semibold"
            >
              My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#68912B] hover:text-[#B22625]"
        >
          <ArrowLeft size={16} />
          My Orders
        </Link>

        {/* ORDER HEADER */}
        <section className="mt-7 overflow-hidden rounded-3xl border border-[#E7E4DC] bg-white">
          <div className="border-b border-[#E7E4DC] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B22625]">
                  Order Details
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
                  {order.orderNumber}
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Placed{" "}
                  {formatDate(
                    order.createdAt
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusClass(
                    order.status
                  )}`}
                >
                  {String(
                    order.status ||
                      "pending"
                  ).replace(
                    /_/g,
                    " "
                  )}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${paymentClass(
                    order.paymentStatus
                  )}`}
                >
                  Payment:{" "}
                  {String(
                    order.paymentStatus ||
                      "unpaid"
                  ).replace(
                    /_/g,
                    " "
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Package
                size={19}
                className="text-[#68912B]"
              />

              <h2 className="text-base font-bold text-[#1F1F1F]">
                Items
              </h2>
            </div>

            <div className="mt-5 divide-y divide-[#E7E4DC]">
              {order.items.map(
                (item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F5F3EC]">
                      {item.productImage ? (
                        <img
                          src={
                            item.productImage
                          }
                          alt={
                            item.productName ||
                            "Product"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          🛒
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#1F1F1F]">
                        {item.productName}
                      </p>

                      {item.variantLabel ? (
                        <p className="mt-1 text-xs text-gray-500">
                          {
                            item.variantLabel
                          }
                        </p>
                      ) : null}

                      <p className="mt-1 text-xs text-gray-500">
                        Qty:{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-gray-500">
                        {formatNaira(
                          item.price
                        )}{" "}
                        each
                      </p>

                      <p className="mt-1 text-base font-bold text-[#1F1F1F]">
                        {formatNaira(
                          item.lineTotal
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* DETAILS GRID */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* CUSTOMER + DELIVERY */}
          <div className="space-y-6">

            <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4E4]">
                  <User
                    size={18}
                    className="text-[#68912B]"
                  />
                </div>

                <h2 className="font-bold text-[#1F1F1F]">
                  Customer Information
                </h2>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">
                    Name
                  </p>

                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {order.customer
                      ?.name ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Phone
                  </p>

                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {order.customer
                      ?.phone ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 break-all font-semibold text-[#1F1F1F]">
                    {order.customer
                      ?.email ||
                      "—"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4E4]">
                  <MapPin
                    size={18}
                    className="text-[#68912B]"
                  />
                </div>

                <h2 className="font-bold text-[#1F1F1F]">
                  Delivery Information
                </h2>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">
                    Address
                  </p>

                  <p className="mt-1 font-semibold leading-6 text-[#1F1F1F]">
                    {order.delivery
                      ?.address ||
                      "—"}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      City
                    </p>

                    <p className="mt-1 font-semibold text-[#1F1F1F]">
                      {order.delivery
                        ?.city ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      State
                    </p>

                    <p className="mt-1 font-semibold text-[#1F1F1F]">
                      {order.delivery
                        ?.state ||
                        "—"}
                    </p>
                  </div>
                </div>

                {order.delivery
                  ?.notes ? (
                  <div>
                    <p className="text-xs text-gray-500">
                      Delivery Notes
                    </p>

                    <p className="mt-1 leading-6 text-gray-700">
                      {
                        order.delivery
                          .notes
                      }
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4E4]">
                <CreditCard
                  size={18}
                  className="text-[#68912B]"
                />
              </div>

              <h2 className="font-bold text-[#1F1F1F]">
                Order Summary
              </h2>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-semibold">
                  {formatNaira(
                    order.subtotal
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Delivery
                </span>

                <span className="font-semibold">
                  {order.deliveryFee >
                  0
                    ? formatNaira(
                        order.deliveryFee
                      )
                    : "Pending"}
                </span>
              </div>

              <div className="border-t border-[#E7E4DC] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[#B22625]">
                    {formatNaira(
                      order.total
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                Payment
              </p>

              <p className="mt-2 text-sm font-semibold capitalize text-[#1F1F1F]">
                {order.paymentStatus ||
                  "Unpaid"}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Payment instructions will be
                provided when your order is
                confirmed.
              </p>
            </div>

            {order.paymentStatus !== "paid" &&
order.status !== "cancelled" &&
order.paymentMethod === "online" ? (
  <div className="mt-5">
    <PayOrderButton
      orderId={order.id}
      onError={(message) =>
        setError(message)
      }
    />
  </div>
) : null}

            <Link
              href="/account/orders"
              className="mt-5 flex h-11 items-center justify-center rounded-xl border border-[#E7E4DC] bg-white text-sm font-bold text-[#1F1F1F] transition hover:bg-[#F5F3EC]"
            >
              Back to My Orders
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
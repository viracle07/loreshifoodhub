"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Package,
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
    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "Date unavailable";
  }
}

function getStatusClasses(status) {
  switch (status) {
    case "completed":
      return "bg-[#EDF4E4] text-[#68912B]";

    case "cancelled":
      return "bg-[#FFF0F0] text-[#B22625]";

    case "processing":
    case "confirmed":
      return "bg-[#FFF7E6] text-[#A66A00]";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getPaymentClasses(status) {
  switch (status) {
    case "paid":
      return "bg-[#EDF4E4] text-[#68912B]";

    case "failed":
      return "bg-[#FFF0F0] text-[#B22625]";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function OrdersPage() {
  const { user, loading: authLoading } =
    useAuth();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadOrders() {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/orders",
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
            "Unable to load your orders."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      console.error(
        "Load orders error:",
        error
      );

      setError(
        error.message ||
          "Unable to load your orders."
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

    loadOrders();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="h-5 w-28 animate-pulse rounded bg-[#F0EEE7]" />

          <div className="mt-8 h-10 w-52 animate-pulse rounded bg-[#F0EEE7]" />

          <div className="mt-8 space-y-4">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-3xl bg-[#F0EEE7]"
                />
              )
            )}
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF4E4]">
            <Package
              size={36}
              className="text-[#68912B]"
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#1F1F1F]">
            Sign in to view your orders
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Your order history is private to your
            account.
          </p>

          <Link
            href="/auth"
            className="mt-7 flex h-12 items-center justify-center rounded-xl bg-[#B22625] px-7 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#68912B] hover:text-[#B22625]"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
            My Account
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
                My Orders
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                View and track your Loreshi FoodHub
                orders.
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#E7E4DC] bg-white px-4 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F5F3EC] disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-[#F1C7C7] bg-[#FFF4F4] p-5">
            <p className="text-sm font-medium text-[#B22625]">
              {error}
            </p>

            <button
              type="button"
              onClick={loadOrders}
              className="mt-3 text-sm font-bold text-[#B22625] underline"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!error && orders.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#E7E4DC] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF4E4]">
              <Package
                size={30}
                className="text-[#68912B]"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#1F1F1F]">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Your completed and current orders will
              appear here.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-6 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
            >
              Start Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : null}

        {orders.length > 0 ? (
          <div className="mt-8 space-y-4">
            {orders.map((order) => {
              const firstItem =
                order.items?.[0];

              const remainingItems =
                Math.max(
                  0,
                  (order.items?.length || 0) -
                    1
                );

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-[#E7E4DC] bg-white transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 border-b border-[#E7E4DC] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Order
                      </p>

                      <p className="mt-1 text-base font-bold text-[#1F1F1F]">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(
                          order.createdAt
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
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
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getPaymentClasses(
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

                  <div className="p-5 sm:p-6">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5F3EC]">
                        {firstItem?.productImage ? (
                          <img
                            src={
                              firstItem.productImage
                            }
                            alt={
                              firstItem.productName ||
                              "Product"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package
                              size={23}
                              className="text-gray-400"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#1F1F1F]">
                          {firstItem?.productName ||
                            "Order item"}
                        </p>

                        {firstItem?.variantLabel ? (
                          <p className="mt-1 text-xs text-gray-500">
                            {
                              firstItem.variantLabel
                            }{" "}
                            ×{" "}
                            {
                              firstItem.quantity
                            }
                          </p>
                        ) : null}

                        {remainingItems >
                        0 ? (
                          <p className="mt-1 text-xs font-medium text-[#68912B]">
                            +{" "}
                            {
                              remainingItems
                            }{" "}
                            more{" "}
                            {remainingItems ===
                            1
                              ? "item"
                              : "items"}
                          </p>
                        ) : null}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs text-gray-500">
                          Total
                        </p>

                        <p className="mt-1 text-base font-bold text-[#B22625]">
                          {formatNaira(
                            order.total
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E7E4DC] bg-white px-4 text-sm font-bold text-[#1F1F1F] transition hover:bg-[#EDF4E4]"
                      >
                        View Order
                        <ArrowRight
                          size={15}
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
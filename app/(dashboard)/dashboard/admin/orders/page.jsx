"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  try {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

    case "confirmed":
      return "bg-[#EAF2FF] text-[#2864C7]";

    case "processing":
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

    case "processing":
      return "bg-[#FFF7E6] text-[#A66A00]";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/orders",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to load admin orders."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      console.error(
        "Admin orders loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      if (
        statusFilter !== "all" &&
        order.status !== statusFilter
      ) {
        return false;
      }

      if (
        paymentFilter !== "all" &&
        order.paymentStatus !== paymentFilter
      ) {
        return false;
      }

      if (searchTerm) {
        const searchableText = [
          order.orderNumber,
          order.customer?.name,
          order.customer?.email,
          order.customer?.phone,
          order.delivery?.address,
          order.delivery?.city,
          order.delivery?.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (
          !searchableText.includes(searchTerm)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
  ]);

  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#68912B] hover:text-[#B22625]"
        >
          <ArrowLeft size={16} />
          Admin Dashboard
        </Link>

        {/* HEADER */}
        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
              Orders
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              View and manage customer orders.
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

        {/* SEARCH */}
        <div className="mt-8">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search order number, customer, email or phone..."
              className="h-12 w-full rounded-2xl border border-[#E7E4DC] bg-white pl-12 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4]"
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-5 rounded-2xl border border-[#E7E4DC] bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* ORDER STATUS */}
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["processing", "Processing"],
                ["confirmed", "Confirmed"],
                ["completed", "Completed"],
                ["cancelled", "Cancelled"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(value)
                  }
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    statusFilter === value
                      ? "bg-[#68912B] text-white"
                      : "border border-[#E7E4DC] bg-white text-[#1F1F1F] hover:bg-[#EDF4E4]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* PAYMENT STATUS */}
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All Payments"],
                ["paid", "Paid"],
                ["unpaid", "Unpaid"],
                ["processing", "Processing"],
                ["failed", "Failed"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setPaymentFilter(value)
                  }
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    paymentFilter === value
                      ? "bg-[#B22625] text-white"
                      : "border border-[#E7E4DC] bg-white text-[#1F1F1F] hover:bg-[#FFF3F3]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadOrders}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : null}

        {/* SUMMARY */}
        {!loading && !error ? (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-bold text-[#1F1F1F]">
                {filteredOrders.length}
              </span>{" "}
              {filteredOrders.length === 1
                ? "order"
                : "orders"}
            </p>
          </div>
        ) : null}

        {/* LOADING */}
        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-3xl bg-[#F0EEE7]"
              />
            ))}
          </div>
        ) : null}

        {/* EMPTY */}
        {!loading &&
        !error &&
        filteredOrders.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-[#D9D5C9] bg-[#FAF9F5] px-6 py-16 text-center">
            <Package
              size={42}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-4 text-xl font-bold text-[#1F1F1F]">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : null}

        {/* ORDERS */}
        {!loading &&
        !error &&
        filteredOrders.length > 0 ? (
          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => {
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
                  className="overflow-hidden rounded-3xl border border-[#E7E4DC] bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* ORDER HEADER */}
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

                  {/* ORDER BODY */}
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

                    {/* CUSTOMER */}
                    <div className="mt-5 grid gap-3 border-t border-[#E7E4DC] pt-5 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                          Customer
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                          {order.customer
                            ?.name ||
                            "Customer"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                          Phone
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                          {order.customer
                            ?.phone ||
                            "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                          Delivery
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                          {order.delivery
                            ?.city ||
                            order.delivery
                              ?.state ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/dashboard/admin/orders/${order.id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
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
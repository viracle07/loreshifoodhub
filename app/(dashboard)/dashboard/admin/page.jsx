"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from "lucide-react";

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
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

    case "confirmed":
      return "bg-[#EAF2FF] text-[#2864C7]";

    case "processing":
      return "bg-[#FFF7E6] text-[#A66A00]";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/dashboard",
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
            "Unable to load dashboard."
        );
      }

      setStats(data.stats || {});
      setRecentOrders(
        Array.isArray(data.recentOrders)
          ? data.recentOrders
          : []
      );
    } catch (error) {
      console.error(
        "Admin dashboard loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] pt-16 lg:pt-0">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="h-5 w-24 animate-pulse rounded bg-[#F0EEE7]" />

          <div className="mt-4 h-10 w-72 animate-pulse rounded bg-[#F0EEE7]" />

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-3xl bg-[#F0EEE7]"
              />
            ))}
          </div>

          <div className="mt-6 h-80 animate-pulse rounded-3xl bg-[#F0EEE7]" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] pt-16 lg:pt-0">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-700 underline"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-16 lg:pt-0">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Here's what's happening with Loreshi
              FoodHub.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#E7E4DC] bg-white px-4 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F5F3EC] sm:self-auto"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* PRIMARY STATS */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* TOTAL ORDERS */}
          <div className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4E4]">
                <ShoppingBag
                  size={20}
                  className="text-[#68912B]"
                />
              </div>

              <span className="text-xs font-semibold text-gray-400">
                All time
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              {stats?.totalOrders || 0}
            </p>

            <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
              Total Orders
            </p>
          </div>

          {/* TODAY ORDERS */}
          <div className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E6]">
                <Clock3
                  size={20}
                  className="text-[#A66A00]"
                />
              </div>

              <span className="text-xs font-semibold text-gray-400">
                Today
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              {stats?.todayOrders || 0}
            </p>

            <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
              Today's Orders
            </p>
          </div>

          {/* REVENUE */}
          <div className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4E4]">
                <TrendingUp
                  size={20}
                  className="text-[#68912B]"
                />
              </div>

              <span className="text-xs font-semibold text-gray-400">
                Paid
              </span>
            </div>

            <p className="mt-5 truncate text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              {formatNaira(
                stats?.totalRevenue
              )}
            </p>

            <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
              Total Revenue
            </p>
          </div>

          {/* PENDING */}
          <div className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E6]">
                <Package
                  size={20}
                  className="text-[#A66A00]"
                />
              </div>

              <span className="text-xs font-semibold text-gray-400">
                Action
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              {stats?.pendingOrders || 0}
            </p>

            <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
              Pending Orders
            </p>
          </div>
        </div>

        {/* SECONDARY STATS */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">

          <div className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={16}
                className="text-[#68912B]"
              />

              <span className="text-xs font-semibold text-gray-500">
                Completed
              </span>
            </div>

            <p className="mt-2 text-xl font-bold text-[#1F1F1F]">
              {stats?.completedOrders ||
                0}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
            <div className="flex items-center gap-2">
              <Clock3
                size={16}
                className="text-[#A66A00]"
              />

              <span className="text-xs font-semibold text-gray-500">
                Processing
              </span>
            </div>

            <p className="mt-2 text-xl font-bold text-[#1F1F1F]">
              {stats?.processingOrders ||
                0}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
            <div className="flex items-center gap-2">
              <CreditCard
                size={16}
                className="text-[#68912B]"
              />

              <span className="text-xs font-semibold text-gray-500">
                Paid
              </span>
            </div>

            <p className="mt-2 text-xl font-bold text-[#1F1F1F]">
              {stats?.paidOrders || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
            <div className="flex items-center gap-2">
              <XCircle
                size={16}
                className="text-[#B22625]"
              />

              <span className="text-xs font-semibold text-gray-500">
                Failed Payments
              </span>
            </div>

            <p className="mt-2 text-xl font-bold text-[#1F1F1F]">
              {stats?.failedPayments ||
                0}
            </p>
          </div>
        </div>

        {/* TODAY REVENUE */}
        <div className="mt-6 rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                Today's Revenue
              </p>

              <p className="mt-1 text-2xl font-bold text-[#B22625]">
                {formatNaira(
                  stats?.todayRevenue
                )}
              </p>
            </div>

            <Link
              href="/dashboard/admin/payments"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#68912B] hover:text-[#B22625]"
            >
              View Payments
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-[#E7E4DC] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#E7E4DC] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                The latest customer orders.
              </p>
            </div>

            <Link
              href="/dashboard/admin/orders"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#68912B] hover:text-[#B22625]"
            >
              View All Orders
              <ArrowRight size={15} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <ShoppingBag
                size={36}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm font-semibold text-gray-500">
                No orders yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E7E4DC]">
              {recentOrders.map(
                (order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/admin/orders/${order.id}`}
                    className="block p-5 transition hover:bg-[#FAF9F5] sm:px-6"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F3EC]">
                        <ShoppingBag
                          size={19}
                          className="text-[#68912B]"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-[#1F1F1F]">
                              {
                                order.orderNumber
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              {
                                order.customer
                                  ?.name
                              }
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                            <p className="text-sm font-bold text-[#B22625]">
                              {formatNaira(
                                order.total
                              )}
                            </p>

                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${getStatusClasses(
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
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-[11px] text-gray-400">
                            {formatDate(
                              order.createdAt
                            )}
                          </p>

                          <span
                            className={`text-[11px] font-semibold capitalize ${
                              order.paymentStatus ===
                              "paid"
                                ? "text-[#68912B]"
                                : order.paymentStatus ===
                                  "failed"
                                ? "text-[#B22625]"
                                : "text-gray-500"
                            }`}
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
                  </Link>
                )
              )}
            </div>
          )}
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-6">
          <h2 className="text-lg font-bold text-[#1F1F1F]">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/admin/orders"
              className="group rounded-2xl border border-[#E7E4DC] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <ShoppingBag
                size={22}
                className="text-[#68912B]"
              />

              <p className="mt-4 text-sm font-bold text-[#1F1F1F]">
                Manage Orders
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                View and process customer orders.
              </p>
            </Link>

            <Link
              href="/dashboard/admin/products"
              className="group rounded-2xl border border-[#E7E4DC] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Package
                size={22}
                className="text-[#68912B]"
              />

              <p className="mt-4 text-sm font-bold text-[#1F1F1F]">
                Manage Products
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Add and update FoodHub products.
              </p>
            </Link>

            <Link
              href="/dashboard/admin/categories"
              className="group rounded-2xl border border-[#E7E4DC] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <BarChart3
                size={22}
                className="text-[#68912B]"
              />

              <p className="mt-4 text-sm font-bold text-[#1F1F1F]">
                Categories
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Organize the product catalogue.
              </p>
            </Link>

            <Link
              href="/dashboard/admin/reports"
              className="group rounded-2xl border border-[#E7E4DC] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <BarChart3
                size={22}
                className="text-[#68912B]"
              />

              <p className="mt-4 text-sm font-bold text-[#1F1F1F]">
                Reports
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Review business performance.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
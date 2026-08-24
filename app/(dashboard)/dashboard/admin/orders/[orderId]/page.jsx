"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "confirmed",
  "completed",
  "cancelled",
];

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
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
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
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

export default function AdminOrderDetailsPage({
  params,
}) {
  const [orderId, setOrderId] =
    useState("");

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        const resolvedParams =
          await params;

        const id =
          resolvedParams?.orderId;

        if (!id) {
          throw new Error(
            "Order ID is missing."
          );
        }

        if (mounted) {
          setOrderId(id);
        }

        const response = await fetch(
          `/api/admin/orders/${encodeURIComponent(
            id
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
              "Unable to load the order."
          );
        }

        if (mounted) {
          setOrder(data.order);
          setSelectedStatus(
            data.order?.status ||
              "pending"
          );
        }
      } catch (error) {
        console.error(
          "Admin order details error:",
          error
        );

        if (mounted) {
          setError(
            error.message ||
              "Unable to load the order."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [params]);

  async function handleStatusUpdate() {
    if (!orderId || !selectedStatus) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(
          orderId
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: selectedStatus,
          }),
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
            "Unable to update order status."
        );
      }

      setOrder(data.order);
      setSelectedStatus(
        data.order?.status ||
          selectedStatus
      );

      setSuccess(
        "Order status updated successfully."
      );
    } catch (error) {
      console.error(
        "Order status update error:",
        error
      );

      setError(
        error.message ||
          "Unable to update order status."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="h-5 w-32 animate-pulse rounded bg-[#F0EEE7]" />

          <div className="mt-8 h-10 w-64 animate-pulse rounded bg-[#F0EEE7]" />

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-3xl bg-[#F0EEE7] lg:col-span-2" />
            <div className="h-64 animate-pulse rounded-3xl bg-[#F0EEE7]" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/dashboard/admin/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#68912B] hover:text-[#B22625]"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const items =
    Array.isArray(order?.items)
      ? order.items
      : [];

  const subtotal = Number(
    order?.subtotal || 0
  );

  const deliveryFee = Number(
    order?.deliveryFee || 0
  );

  const total = Number(
    order?.total || 0
  );

  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

        {/* BACK */}
        <Link
          href="/dashboard/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#68912B] hover:text-[#B22625]"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        {/* HEADER */}
        <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
              Order Details
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
              {order?.orderNumber ||
                "Order"}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Placed{" "}
              {formatDate(
                order?.createdAt
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${getStatusClasses(
                order?.status
              )}`}
            >
              {String(
                order?.status ||
                  "pending"
              ).replace(
                /_/g,
                " "
              )}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${getPaymentClasses(
                order?.paymentStatus
              )}`}
            >
              Payment:{" "}
              {String(
                order?.paymentStatus ||
                  "unpaid"
              ).replace(
                /_/g,
                " "
              )}
            </span>
          </div>
        </div>

        {/* MESSAGES */}
        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#CFE3B7] bg-[#EDF4E4] p-4 text-sm font-medium text-[#68912B]">
            <CheckCircle2 size={18} />
            {success}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">

            {/* ITEMS */}
            <section className="rounded-3xl border border-[#E7E4DC] bg-white">
              <div className="border-b border-[#E7E4DC] p-5 sm:p-6">
                <h2 className="text-lg font-bold text-[#1F1F1F]">
                  Order Items
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {items.length}{" "}
                  {items.length === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

              <div className="divide-y divide-[#E7E4DC]">
                {items.map(
                  (item, index) => {
                    const itemTotal =
                      Number(
                        item.price || 0
                      ) *
                      Number(
                        item.quantity || 0
                      );

                    return (
                      <div
                        key={
                          item.id ||
                          `${item.productId}-${item.variantId}-${index}`
                        }
                        className="flex gap-4 p-5 sm:p-6"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F5F3EC]">
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
                              <Package
                                size={28}
                                className="text-gray-400"
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-[#1F1F1F]">
                            {item.productName ||
                              "Product"}
                          </h3>

                          {item.variantLabel ? (
                            <p className="mt-1 text-xs text-gray-500">
                              {
                                item.variantLabel
                              }
                            </p>
                          ) : null}

                          <p className="mt-2 text-xs text-gray-500">
                            Quantity:{" "}
                            <span className="font-semibold text-[#1F1F1F]">
                              {item.quantity}
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Unit price:{" "}
                            <span className="font-semibold text-[#1F1F1F]">
                              {formatNaira(
                                item.price
                              )}
                            </span>
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs text-gray-500">
                            Total
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#B22625]">
                            {formatNaira(
                              itemTotal
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* TOTALS */}
              <div className="border-t border-[#E7E4DC] bg-[#FAF9F5] p-5 sm:p-6">
                <div className="ml-auto max-w-sm space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Subtotal
                    </span>

                    <span className="font-semibold text-[#1F1F1F]">
                      {formatNaira(
                        subtotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Delivery
                    </span>

                    <span className="font-semibold text-[#1F1F1F]">
                      {formatNaira(
                        deliveryFee
                      )}
                    </span>
                  </div>

                  <div className="border-t border-[#E7E4DC] pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-[#1F1F1F]">
                        Order Total
                      </span>

                      <span className="text-lg font-bold text-[#B22625]">
                        {formatNaira(
                          total
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CUSTOMER */}
            <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                Customer Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                    {order?.customer
                      ?.name ||
                      "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-[#1F1F1F]">
                    {order?.customer
                      ?.email ||
                      "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                    {order?.customer
                      ?.phone ||
                      "Not provided"}
                  </p>
                </div>
              </div>
            </section>

            {/* DELIVERY */}
            <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4E4]">
                  <Truck
                    size={20}
                    className="text-[#68912B]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#1F1F1F]">
                    Delivery Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Customer delivery details
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                    Address
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-6 text-[#1F1F1F]">
                    {order?.delivery
                      ?.address ||
                      "Not provided"}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      City
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                      {order?.delivery
                        ?.city ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      State
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                      {order?.delivery
                        ?.state ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                {order?.delivery
                  ?.notes ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Delivery Notes
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {
                        order
                          .delivery
                          .notes
                      }
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="space-y-6">

            {/* STATUS MANAGEMENT */}
            <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                Order Status
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Update the current fulfilment status
                of this order.
              </p>

              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
                className="mt-5 h-12 w-full rounded-xl border border-[#E7E4DC] bg-white px-4 text-sm font-semibold text-[#1F1F1F] outline-none focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4]"
              >
                {ORDER_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status
                        .charAt(0)
                        .toUpperCase() +
                        status
                          .slice(1)
                          .replace(
                            /_/g,
                            " "
                          )}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                onClick={
                  handleStatusUpdate
                }
                disabled={
                  saving ||
                  selectedStatus ===
                    order?.status
                }
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={16}
                    />
                    Update Status
                  </>
                )}
              </button>
            </section>

            {/* PAYMENT */}
            <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                Payment
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getPaymentClasses(
                      order?.paymentStatus
                    )}`}
                  >
                    {String(
                      order?.paymentStatus ||
                        "unpaid"
                    ).replace(
                      /_/g,
                      " "
                    )}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Method
                  </span>

                  <span className="text-right text-sm font-semibold capitalize text-[#1F1F1F]">
                    {String(
                      order?.paymentMethod ||
                        "Not specified"
                    ).replace(
                      /_/g,
                      " "
                    )}
                  </span>
                </div>

                {order?.paymentReference ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Paystack Reference
                    </p>

                    <p className="mt-1 break-all rounded-xl bg-[#FAF9F5] p-3 text-xs font-medium text-gray-600">
                      {
                        order.paymentReference
                      }
                    </p>
                  </div>
                ) : null}

                {order?.paidAt ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Paid At
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                      {formatDate(
                        order.paidAt
                      )}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            {/* ORDER INFO */}
            <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                Order Information
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                    Order ID
                  </p>

                  <p className="mt-1 break-all text-xs font-medium text-gray-600">
                    {order?.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                    {formatDate(
                      order?.createdAt
                    )}
                  </p>
                </div>

                {order?.updatedAt ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                      {formatDate(
                        order.updatedAt
                      )}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
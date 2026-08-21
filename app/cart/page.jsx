"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

export default function CartPage() {
  const {
    items,
    hydrated,
    itemCount,
    subtotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="h-8 w-40 animate-pulse rounded bg-[#F0EEE7]" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-48 animate-pulse rounded-3xl bg-[#F0EEE7]" />
            <div className="h-64 animate-pulse rounded-3xl bg-[#F0EEE7]" />
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center sm:px-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF4E4]">
            <ShoppingBag
              size={34}
              className="text-[#68912B]"
            />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
            Your Cart
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
            Your cart is empty
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
            You haven't added anything to your
            cart yet. Browse our products and
            find something you love.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#B22625] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
          >
            Start Shopping
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
              Loreshi FoodHub
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
              Your Cart
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}{" "}
              in your cart.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="self-start text-sm font-semibold text-[#B22625] transition hover:text-[#8F1D1D] sm:self-auto"
          >
            Clear cart
          </button>
        </div>

        {/* CART CONTENT */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* ITEMS */}
          <section className="overflow-hidden rounded-3xl border border-[#E7E4DC] bg-white">
            <div className="border-b border-[#E7E4DC] px-5 py-4 sm:px-6">
              <h2 className="text-base font-bold text-[#1F1F1F]">
                Cart Items
              </h2>
            </div>

            <div className="divide-y divide-[#E7E4DC]">
              {items.map((item) => (
                <article
                  key={item.cartItemId}
                  className="p-4 sm:p-6"
                >
                  <div className="flex gap-4">
                    {/* IMAGE */}
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#F5F3EC] sm:h-28 sm:w-28"
                    >
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-3xl">
                            🛒
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* DETAILS */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#68912B]">
                            {item.categoryName ||
                              "Foodstuff"}
                          </p>

                          <Link
                            href={`/products/${item.productSlug}`}
                            className="mt-1 block text-sm font-bold text-[#1F1F1F] hover:text-[#B22625] sm:text-base"
                          >
                            {item.productName}
                          </Link>

                          {item.variantLabel ? (
                            <p className="mt-1 text-xs text-gray-500">
                              {item.variantLabel}
                            </p>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.cartItemId
                            )
                          }
                          aria-label={`Remove ${item.productName}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-[#FFF0F0] hover:text-[#B22625]"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      {/* PRICE + QUANTITY */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-bold text-[#B22625]">
                          {formatNaira(
                            item.price
                          )}
                        </p>

                        <div className="flex items-center rounded-xl border border-[#E7E4DC]">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.cartItemId
                              )
                            }
                            aria-label="Decrease quantity"
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:bg-[#F5F3EC]"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="flex h-9 min-w-9 items-center justify-center border-x border-[#E7E4DC] px-2 text-sm font-bold text-[#1F1F1F]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.cartItemId
                              )
                            }
                            aria-label="Increase quantity"
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:bg-[#F5F3EC]"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>

                      <p className="mt-2 text-right text-sm font-bold text-[#1F1F1F]">
                        {formatNaira(
                          item.price *
                            item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SUMMARY */}
          <aside className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-[#1F1F1F]">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Items
                </span>

                <span className="font-semibold text-[#1F1F1F]">
                  {itemCount}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-semibold text-[#1F1F1F]">
                  {formatNaira(subtotal)}
                </span>
              </div>

              <div className="border-t border-[#E7E4DC] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#1F1F1F]">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[#B22625]">
                    {formatNaira(subtotal)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
            >
              Proceed to Checkout
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/products"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-[#E7E4DC] bg-white px-5 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F5F3EC]"
            >
              Continue Shopping
            </Link>

            <p className="mt-5 text-center text-xs leading-5 text-gray-500">
              Delivery charges will be calculated
              during checkout.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
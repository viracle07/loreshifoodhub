"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    User,
    Phone,
    Mail,
    FileText,
} from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";
import { useAuth } from "@/app/context/AuthContext";

function formatNaira(amount) {
    return `₦${Number(amount || 0).toLocaleString(
        "en-NG"
    )}`;
}

export default function CheckoutPage() {
    const { items, hydrated, itemCount, subtotal } =
        useCart();

    const { user, loading: authLoading } =
        useAuth();

    const [form, setForm] = useState({
        name: user?.displayName || "",
        phone: "",
        email: user?.email || "",
        address: "",
        city: "",
        state: "",
        notes: "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");


    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    }

    function validateForm() {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name =
                "Please enter your full name.";
        }

        if (!form.phone.trim()) {
            newErrors.phone =
                "Please enter your phone number.";
        }

        if (!form.email.trim()) {
            newErrors.email =
                "Please enter your email address.";
        }

        if (!form.address.trim()) {
            newErrors.address =
                "Please enter your delivery address.";
        }

        if (!form.city.trim()) {
            newErrors.city =
                "Please enter your city.";
        }

        if (!form.state.trim()) {
            newErrors.state =
                "Please enter your state.";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSubmitError("");

        if (!validateForm()) {
            return;
        }

        if (!items.length) {
            setSubmitError(
                "Your cart is empty."
            );
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch(
                "/api/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        customer: {
                            name: form.name,
                            phone: form.phone,
                            email: form.email,
                        },

                        delivery: {
                            address: form.address,
                            city: form.city,
                            state: form.state,
                            notes: form.notes,
                        },

                        items: items.map((item) => ({
                            productId: item.productId,
                            variantId: item.variantId,
                            quantity: item.quantity,
                        })),
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
                    "Unable to create your order."
                );
            }

            /*
             * Order successfully created.
             *
             * We'll redirect to the order
             * confirmation page next.
             */
            window.location.href =
                `/order-success?order=${encodeURIComponent(
                    data.order.orderNumber
                )}`;
        } catch (error) {
            console.error(
                "Checkout error:",
                error
            );

            setSubmitError(
                error.message ||
                "Unable to create your order. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (
        !hydrated ||
        authLoading
    ) {
        return (
            <main className="min-h-screen bg-[#FFFDF8]">
                <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                    <div className="h-8 w-48 animate-pulse rounded bg-[#F0EEE7]" />

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="h-[600px] animate-pulse rounded-3xl bg-[#F0EEE7]" />

                        <div className="h-80 animate-pulse rounded-3xl bg-[#F0EEE7]" />
                    </div>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-[#FFFDF8]">
                <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF4E4]">
                        <User
                            size={34}
                            className="text-[#68912B]"
                        />
                    </div>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
                        Checkout
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
                        Sign in to continue
                    </h1>

                    <p className="mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                        Please sign in to your Loreshi FoodHub
                        account before completing your order.
                    </p>

                    <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
                        <Link
                            href="/auth"
                            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
                        >
                            Sign In
                        </Link>

                        <Link
                            href="/cart"
                            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#E7E4DC] bg-white px-5 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F5F3EC]"
                        >
                            Back to Cart
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-[#FFFDF8]">
                <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF4E4]">
                        <MapPin
                            size={34}
                            className="text-[#68912B]"
                        />
                    </div>

                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#1F1F1F]">
                        Your cart is empty
                    </h1>

                    <p className="mt-3 text-sm text-gray-600">
                        Add products to your cart before
                        proceeding to checkout.
                    </p>

                    <Link
                        href="/products"
                        className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-6 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
                    >
                        Browse Products
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
                <div>
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#68912B] hover:text-[#B22625]"
                    >
                        <ArrowLeft size={16} />
                        Back to Cart
                    </Link>

                    <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
                        Loreshi FoodHub
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
                        Checkout
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Enter your delivery details to continue
                        with your order.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start"
                >
                    {/* CUSTOMER + DELIVERY */}
                    <div className="space-y-6">

                        {/* CUSTOMER INFORMATION */}
                        <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4E4]">
                                    <User
                                        size={19}
                                        className="text-[#68912B]"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-[#1F1F1F]">
                                        Customer Information
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Who should receive this order?
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">

                                {/* NAME */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="text-sm font-semibold text-[#1F1F1F]"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] ${errors.name
                                                ? "border-[#B22625]"
                                                : "border-[#E7E4DC]"
                                            }`}
                                    />

                                    {errors.name ? (
                                        <p className="mt-1.5 text-xs text-[#B22625]">
                                            {errors.name}
                                        </p>
                                    ) : null}
                                </div>

                                {/* PHONE */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="flex items-center gap-1.5 text-sm font-semibold text-[#1F1F1F]"
                                    >
                                        <Phone size={14} />
                                        Phone Number
                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="08012345678"
                                        className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] ${errors.phone
                                                ? "border-[#B22625]"
                                                : "border-[#E7E4DC]"
                                            }`}
                                    />

                                    {errors.phone ? (
                                        <p className="mt-1.5 text-xs text-[#B22625]">
                                            {errors.phone}
                                        </p>
                                    ) : null}
                                </div>

                                {/* EMAIL */}
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="email"
                                        className="flex items-center gap-1.5 text-sm font-semibold text-[#1F1F1F]"
                                    >
                                        <Mail size={14} />
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] ${errors.email
                                                ? "border-[#B22625]"
                                                : "border-[#E7E4DC]"
                                            }`}
                                    />

                                    {errors.email ? (
                                        <p className="mt-1.5 text-xs text-[#B22625]">
                                            {errors.email}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </section>

                        {/* DELIVERY INFORMATION */}
                        <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4E4]">
                                    <MapPin
                                        size={19}
                                        className="text-[#68912B]"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-[#1F1F1F]">
                                        Delivery Information
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Where should we deliver your order?
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-5">

                                {/* ADDRESS */}
                                <div>
                                    <label
                                        htmlFor="address"
                                        className="text-sm font-semibold text-[#1F1F1F]"
                                    >
                                        Delivery Address
                                    </label>

                                    <textarea
                                        id="address"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="House number, street, area..."
                                        className={`mt-2 w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] ${errors.address
                                                ? "border-[#B22625]"
                                                : "border-[#E7E4DC]"
                                            }`}
                                    />

                                    {errors.address ? (
                                        <p className="mt-1.5 text-xs text-[#B22625]">
                                            {errors.address}
                                        </p>
                                    ) : null}
                                </div>

                                {/* CITY + STATE */}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="text-sm font-semibold text-[#1F1F1F]"
                                        >
                                            City
                                        </label>

                                        <input
                                            id="city"
                                            name="city"
                                            type="text"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="Lagos"
                                            className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] ${errors.city
                                                    ? "border-[#B22625]"
                                                    : "border-[#E7E4DC]"
                                                }`}
                                        />

                                        {errors.city ? (
                                            <p className="mt-1.5 text-xs text-[#B22625]">
                                                {errors.city}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="state"
                                            className="text-sm font-semibold text-[#1F1F1F]"
                                        >
                                            State
                                        </label>

                                        <input
                                            id="state"
                                            name="state"
                                            type="text"
                                            value={form.state}
                                            onChange={handleChange}
                                            placeholder="Lagos State"
                                            className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] ${errors.state
                                                    ? "border-[#B22625]"
                                                    : "border-[#E7E4DC]"
                                                }`}
                                        />

                                        {errors.state ? (
                                            <p className="mt-1.5 text-xs text-[#B22625]">
                                                {errors.state}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                {/* NOTES */}
                                <div>
                                    <label
                                        htmlFor="notes"
                                        className="flex items-center gap-1.5 text-sm font-semibold text-[#1F1F1F]"
                                    >
                                        <FileText size={14} />
                                        Delivery Notes
                                        <span className="font-normal text-gray-400">
                                            (optional)
                                        </span>
                                    </label>

                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Gate instructions, landmarks, preferred delivery time..."
                                        className="mt-2 w-full resize-none rounded-xl border border-[#E7E4DC] bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4]"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ORDER SUMMARY */}
                    <aside className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-6 lg:sticky lg:top-24">
                        <h2 className="text-lg font-bold text-[#1F1F1F]">
                            Order Summary
                        </h2>

                        <div className="mt-5 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.cartItemId}
                                    className="flex gap-3"
                                >
                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F5F3EC]">
                                        {item.productImage ? (
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                🛒
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-1 text-sm font-semibold text-[#1F1F1F]">
                                            {item.productName}
                                        </p>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {item.variantLabel}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>

                                    <p className="shrink-0 text-sm font-bold text-[#1F1F1F]">
                                        {formatNaira(
                                            item.price *
                                            item.quantity
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 border-t border-[#E7E4DC] pt-5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Items
                                </span>

                                <span className="font-semibold">
                                    {itemCount}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Subtotal
                                </span>

                                <span className="font-semibold">
                                    {formatNaira(subtotal)}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Delivery
                                </span>

                                <span className="font-semibold text-[#68912B]">
                                    Calculated later
                                </span>
                            </div>

                            <div className="mt-5 border-t border-[#E7E4DC] pt-5">
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

                        {submitError ? (
                            <div className="mt-5 rounded-xl border border-[#F1C7C7] bg-[#FFF4F4] px-4 py-3">
                                <p className="text-sm font-medium text-[#B22625]">
                                    {submitError}
                                </p>
                            </div>
                        ) : null}

                       <button
  type="submit"
  disabled={submitting}
  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D] disabled:cursor-not-allowed disabled:bg-gray-300"
>
  {submitting ? (
    <>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      Creating Order...
    </>
  ) : (
    <>
      Place Order
      <ArrowRight size={17} />
    </>
  )}
</button>

                        <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                            Your order will be reviewed before
                            final delivery charges and payment
                            instructions are confirmed.
                        </p>
                    </aside>
                </form>
            </div>
        </main>
    );
}
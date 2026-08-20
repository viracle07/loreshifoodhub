"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    Menu,
    ShoppingCart,
    User,
    X,
    LogOut,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";

export default function StorefrontHeader() {
    const { user, loading, signOut } = useAuth();

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const [accountOpen, setAccountOpen] =
        useState(false);

    const accountRef = useRef(null);

    function closeMobileMenu() {
        setMobileOpen(false);
    }

    async function handleSignOut() {
        setAccountOpen(false);
        setMobileOpen(false);

        try {
            await signOut();
        } catch (error) {
            console.error(
                "Sign out error:",
                error
            );
        }
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                accountRef.current &&
                !accountRef.current.contains(
                    event.target
                )
            ) {
                setAccountOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const userPhoto =
        user?.photoURL ||
        user?.photoUrl ||
        user?.picture ||
        "";

    const userName =
        user?.displayName ||
        user?.name ||
        "Account";

    const userEmail =
        user?.email || "";

    return (
        <header className="sticky top-0 z-40 border-b border-[#E7E4DC] bg-[#FFFDF8]/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

                {/* LOGO */}
                <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF4E4]">
                        <span
                            className="text-lg"
                            aria-hidden="true"
                        >
                            🍎
                        </span>
                    </div>

                    <div>
                        <p className="text-sm font-bold leading-tight text-[#1F1F1F]">
                            Loreshi
                        </p>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#68912B]">
                            FoodHub
                        </p>
                    </div>
                </Link>

                {/* DESKTOP NAV */}
                <nav className="hidden items-center gap-7 md:flex">
                    <Link
                        href="/"
                        className="text-sm font-semibold text-[#1F1F1F] transition hover:text-[#B22625]"
                    >
                        Home
                    </Link>

                    <Link
                        href="/products"
                        className="text-sm font-semibold text-[#1F1F1F] transition hover:text-[#B22625]"
                    >
                        Products
                    </Link>

                    <Link
                        href="/products?new=true"
                        className="text-sm font-semibold text-[#1F1F1F] transition hover:text-[#B22625]"
                    >
                        New
                    </Link>

                    <Link
                        href="/products?hot=true"
                        className="text-sm font-semibold text-[#1F1F1F] transition hover:text-[#B22625]"
                    >
                        Hot
                    </Link>
                </nav>

                {/* ACTIONS */}
                <div className="flex items-center gap-1">

                    {/* ACCOUNT */}
                    {loading ? (
                        <div className="h-9 w-9 animate-pulse rounded-full bg-[#EDF4E4]" />
                    ) : user ? (
                        <div
                            ref={accountRef}
                            className="relative"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setAccountOpen(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                aria-label="Open account menu"
                                aria-expanded={accountOpen}
                                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#E7E4DC] bg-[#EDF4E4] transition hover:border-[#68912B] focus:outline-none focus:ring-2 focus:ring-[#EDF4E4]"
                            >
                                {userPhoto ? (
                                    <img
                                        src={userPhoto}
                                        alt={userName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User
                                        size={19}
                                        className="text-[#68912B]"
                                    />
                                )}
                            </button>

                            {/* ACCOUNT DROPDOWN */}
                            {accountOpen ? (
                                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[#E7E4DC] bg-white shadow-xl">
                                    <div className="flex items-center gap-3 border-b border-[#E7E4DC] p-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDF4E4]">
                                            {userPhoto ? (
                                                <img
                                                    src={userPhoto}
                                                    alt={userName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <User
                                                    size={18}
                                                    className="text-[#68912B]"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-[#1F1F1F]">
                                                {userName}
                                            </p>

                                            {userEmail ? (
                                                <p className="truncate text-xs text-gray-500">
                                                    {userEmail}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            type="button"
                                            onClick={
                                                handleSignOut
                                            }
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#B22625] transition hover:bg-[#FFF0F0]"
                                        >
                                            <LogOut size={17} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <Link
                            href="/auth"
                            onClick={
                                closeMobileMenu
                            }
                            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-[#1F1F1F] transition hover:bg-[#EDF4E4] hover:text-[#68912B] md:px-4 md:text-sm"
                        >
                            <User size={17} />
                            <span>Sign In</span>
                        </Link>
                    )}

                    {/* CART */}
                    <Link
                        href="/cart"
                        aria-label="Shopping cart"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#1F1F1F] transition hover:bg-[#FFF0F0] hover:text-[#B22625]"
                    >
                        <ShoppingCart size={19} />
                    </Link>

                    {/* MOBILE MENU */}
                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(
                                (previous) =>
                                    !previous
                            )
                        }
                        aria-label={
                            mobileOpen
                                ? "Close menu"
                                : "Open menu"
                        }
                        aria-expanded={mobileOpen}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#1F1F1F] transition hover:bg-[#EDF4E4] md:hidden"
                    >
                        {mobileOpen ? (
                            <X size={21} />
                        ) : (
                            <Menu size={21} />
                        )}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {mobileOpen ? (
                <div className="border-t border-[#E7E4DC] bg-[#FFFDF8] md:hidden">
                    <nav className="mx-auto max-w-7xl px-5 py-4 sm:px-6">
                        <div className="flex flex-col">
                            <Link
                                href="/"
                                onClick={closeMobileMenu}
                                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#1F1F1F] hover:bg-[#EDF4E4]"
                            >
                                Home
                            </Link>

                            <Link
                                href="/products"
                                onClick={closeMobileMenu}
                                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#1F1F1F] hover:bg-[#EDF4E4]"
                            >
                                Products
                            </Link>

                            <Link
                                href="/products?new=true"
                                onClick={closeMobileMenu}
                                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#1F1F1F] hover:bg-[#EDF4E4]"
                            >
                                🆕 New Products
                            </Link>

                            <Link
                                href="/products?hot=true"
                                onClick={closeMobileMenu}
                                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#1F1F1F] hover:bg-[#FFF0F0]"
                            >
                                🔥 Hot Products
                            </Link>
                        </div>
                    </nav>
                </div>
            ) : null}
        </header>
    );
}
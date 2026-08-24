"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";

const NAVIGATION = [
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/dashboard/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Products",
    href: "/dashboard/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/dashboard/admin/categories",
    icon: Boxes,
  },
  {
    label: "Customers",
    href: "/dashboard/admin/customers",
    icon: Users,
  },
  {
    label: "Payments",
    href: "/dashboard/admin/payments",
    icon: CreditCard,
  },
  {
    label: "Reports",
    href: "/dashboard/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];

function isActiveRoute(pathname, href) {
  if (href === "/dashboard/admin") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
    } catch (error) {
      console.error(
        "Admin sign out error:",
        error
      );
    } finally {
      router.push("/admin-login");
      router.refresh();
    }
  }

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#E7E4DC] bg-white px-4 lg:hidden">
        <Link
          href="/dashboard/admin"
          className="flex items-center gap-3"
          onClick={() =>
            setMobileOpen(false)
          }
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#68912B] text-white">
            <Store size={19} />
          </div>

          <div>
            <p className="text-sm font-bold text-[#1F1F1F]">
              Loreshi FoodHub
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B22625]">
              Admin
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E4DC] bg-white text-[#1F1F1F]"
          aria-label="Open admin menu"
        >
          <Menu size={21} />
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      ) : null}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E7E4DC] bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* BRAND */}
        <div className="flex h-20 items-center justify-between border-b border-[#E7E4DC] px-5">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#68912B] text-white">
              <Store size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#1F1F1F]">
                Loreshi FoodHub
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B22625]">
                Administration
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-[#F5F3EC] lg:hidden"
            aria-label="Close admin menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
            Management
          </p>

          <div className="space-y-1">
            {NAVIGATION.map(
              ({
                label,
                href,
                icon: Icon,
              }) => {
                const active =
                  isActiveRoute(
                    pathname,
                    href
                  );

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[#EDF4E4] text-[#68912B]"
                        : "text-gray-600 hover:bg-[#F5F3EC] hover:text-[#1F1F1F]"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={
                        active ? 2.5 : 2
                      }
                    />

                    <span>{label}</span>
                  </Link>
                );
              }
            )}
          </div>
        </nav>

        {/* BOTTOM */}
        <div className="border-t border-[#E7E4DC] p-3">
          <Link
            href="/"
            onClick={() =>
              setMobileOpen(false)
            }
            className="mb-1 flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-gray-600 transition hover:bg-[#F5F3EC] hover:text-[#1F1F1F]"
          >
            <Store size={18} />
            View Store
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#B22625] transition hover:bg-[#FFF3F3]"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
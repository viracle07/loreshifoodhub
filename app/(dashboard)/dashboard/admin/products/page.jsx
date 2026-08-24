"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Package,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function getStatusClasses(active) {
  return active
    ? "bg-[#EDF4E4] text-[#68912B]"
    : "bg-gray-100 text-gray-500";
}

function getStockClasses(status) {
  switch (status) {
    case "in_stock":
      return "bg-[#EDF4E4] text-[#68912B]";

    case "out_of_stock":
      return "bg-[#FFF0F0] text-[#B22625]";

    case "discontinued":
      return "bg-gray-100 text-gray-500";

    default:
      return "bg-[#FFF7E6] text-[#A66A00]";
  }
}

function formatStockLabel(status) {
  return String(status || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [stockFilter, setStockFilter] =
    useState("all");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/products",
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
            "Unable to load products."
        );
      }

      setProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );
    } catch (error) {
      console.error(
        "Admin products loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = new Map();

    products.forEach((product) => {
      if (
        product.categoryId &&
        product.categoryName
      ) {
        values.set(
          product.categoryId,
          product.categoryName
        );
      }
    });

    return Array.from(
      values.entries()
    );
  }, [products]);

  const filteredProducts =
    useMemo(() => {
      const searchTerm =
        search.trim().toLowerCase();

      return products.filter(
        (product) => {
          if (
            categoryFilter !== "all" &&
            product.categoryId !==
              categoryFilter
          ) {
            return false;
          }

          if (
            statusFilter !== "all" &&
            (statusFilter === "active"
              ? product.active !== true
              : product.active === true)
          ) {
            return false;
          }

          if (
            stockFilter !== "all" &&
            product.stockStatus !==
              stockFilter
          ) {
            return false;
          }

          if (searchTerm) {
            const searchableText = [
              product.name,
              product.description,
              product.categoryName,
              product.slug,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            if (
              !searchableText.includes(
                searchTerm
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      products,
      search,
      categoryFilter,
      statusFilter,
      stockFilter,
    ]);

  const activeCount = products.filter(
    (product) =>
      product.active !== false
  ).length;

  const inactiveCount =
    products.length - activeCount;

  const outOfStockCount =
    products.filter(
      (product) =>
        product.stockStatus ===
        "out_of_stock"
    ).length;

  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-16 lg:pt-0">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#68912B] hover:text-[#B22625]"
            >
              <ArrowLeft size={16} />
              Admin Dashboard
            </Link>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
              Catalogue Management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
              Products
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Manage the products displayed in
              Loreshi FoodHub.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E7E4DC] bg-white px-4 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F5F3EC] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <Link
              href="/dashboard/admin/products/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 text-sm font-bold text-white transition hover:bg-[#8F1D1D]"
            >
              <Plus size={17} />
              Add Product
            </Link>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
            <div className="flex items-center gap-2">
              <Package
                size={17}
                className="text-[#68912B]"
              />

              <span className="text-xs font-semibold text-gray-500">
                Total
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
            <div className="flex items-center gap-2">
              <Boxes
                size={17}
                className="text-[#68912B]"
              />

              <span className="text-xs font-semibold text-gray-500">
                Active
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-[#68912B]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
            <div className="flex items-center gap-2">
              <Package
                size={17}
                className="text-gray-400"
              />

              <span className="text-xs font-semibold text-gray-500">
                Inactive
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-gray-600">
              {inactiveCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
            <div className="flex items-center gap-2">
              <Package
                size={17}
                className="text-[#B22625]"
              />

              <span className="text-xs font-semibold text-gray-500">
                Out of Stock
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-[#B22625]">
              {outOfStockCount}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <section className="mt-6 rounded-3xl border border-[#E7E4DC] bg-white p-4 sm:p-5">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products..."
              className="h-12 w-full rounded-xl border border-[#E7E4DC] bg-white pl-12 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4]"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-[#E7E4DC] bg-white px-3 text-sm font-semibold text-[#1F1F1F] outline-none focus:border-[#68912B]"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map(
                ([id, name]) => (
                  <option
                    key={id}
                    value={id}
                  >
                    {name}
                  </option>
                )
              )}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-[#E7E4DC] bg-white px-3 text-sm font-semibold text-[#1F1F1F] outline-none focus:border-[#68912B]"
            >
              <option value="all">
                All Product Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-[#E7E4DC] bg-white px-3 text-sm font-semibold text-[#1F1F1F] outline-none focus:border-[#68912B]"
            >
              <option value="all">
                All Stock Status
              </option>

              <option value="in_stock">
                In Stock
              </option>

              <option value="out_of_stock">
                Out of Stock
              </option>

              <option value="discontinued">
                Discontinued
              </option>
            </select>
          </div>
        </section>

        {/* ERROR */}
        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProducts}
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-700 underline"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : null}

        {/* RESULT COUNT */}
        {!loading && !error ? (
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-bold text-[#1F1F1F]">
                {
                  filteredProducts.length
                }
              </span>{" "}
              {filteredProducts.length ===
              1
                ? "product"
                : "products"}
            </p>
          </div>
        ) : null}

        {/* LOADING */}
        {loading ? (
          <div className="mt-5 space-y-3">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-[#F0EEE7]"
              />
            ))}
          </div>
        ) : null}

        {/* EMPTY */}
        {!loading &&
        !error &&
        filteredProducts.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-[#D9D5C9] bg-[#FAF9F5] px-6 py-16 text-center">
            <Package
              size={40}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-xl font-bold text-[#1F1F1F]">
              No products found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or
              filters.
            </p>
          </div>
        ) : null}

        {/* DESKTOP TABLE */}
        {!loading &&
        !error &&
        filteredProducts.length > 0 ? (
          <div className="mt-5 hidden overflow-hidden rounded-3xl border border-[#E7E4DC] bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-[#E7E4DC] bg-[#FAF9F5]">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      Price
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      Tags
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E7E4DC]">
                  {filteredProducts.map(
                    (product) => {
                      const activeVariants =
                        Array.isArray(
                          product.variants
                        )
                          ? product.variants.filter(
                              (variant) =>
                                variant.active !==
                                false
                            )
                          : [];

                      const firstVariant =
                        activeVariants[0];

                      const image =
                        product.images?.[0];

                      return (
                        <tr
                          key={product.id}
                          className="transition hover:bg-[#FAF9F5]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F5F3EC]">
                                {image?.url ? (
                                  <img
                                    src={
                                      image.url
                                    }
                                    alt={
                                      image.alt ||
                                      product.name
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Package
                                      size={21}
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[230px] truncate text-sm font-bold text-[#1F1F1F]">
                                  {
                                    product.name
                                  }
                                </p>

                                <p className="mt-1 max-w-[230px] truncate text-xs text-gray-400">
                                  {
                                    product.slug
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-gray-600">
                              {product.categoryName ||
                                "Uncategorized"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-bold text-[#1F1F1F]">
                                {firstVariant
                                  ? formatNaira(
                                      firstVariant.price
                                    )
                                  : "—"}
                              </p>

                              {activeVariants.length >
                              1 ? (
                                <p className="mt-1 text-[11px] text-gray-400">
                                  +
                                  {" "}
                                  {activeVariants.length -
                                    1}{" "}
                                  more variant
                                  {activeVariants.length -
                                    1 ===
                                  1
                                    ? ""
                                    : "s"}
                                </p>
                              ) : null}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStockClasses(
                                product.stockStatus
                              )}`}
                            >
                              {formatStockLabel(
                                product.stockStatus
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusClasses(
                                product.active !==
                                  false
                              )}`}
                            >
                              {product.active !==
                              false
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1">
                              {product.isNew ? (
                                <span className="rounded-full bg-[#EDF4E4] px-2 py-1 text-[10px] font-bold text-[#68912B]">
                                  NEW
                                </span>
                              ) : null}

                              {product.isHot ? (
                                <span className="rounded-full bg-[#FFF0F0] px-2 py-1 text-[10px] font-bold text-[#B22625]">
                                  HOT
                                </span>
                              ) : null}

                              {product.featured ? (
                                <span className="rounded-full bg-[#F5F3EC] px-2 py-1 text-[10px] font-bold text-gray-600">
                                  ★
                                </span>
                              ) : null}

                              {!product.isNew &&
                              !product.isHot &&
                              !product.featured ? (
                                <span className="text-xs text-gray-400">
                                  —
                                </span>
                              ) : null}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/dashboard/admin/products/${product.id}`}
                              className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-[#E7E4DC] bg-white px-3 text-xs font-bold text-[#1F1F1F] transition hover:bg-[#EDF4E4]"
                            >
                              Edit
                              <ArrowRight
                                size={13}
                              />
                            </Link>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* MOBILE/TABLET CARDS */}
        {!loading &&
        !error &&
        filteredProducts.length > 0 ? (
          <div className="mt-5 space-y-3 lg:hidden">
            {filteredProducts.map(
              (product) => {
                const activeVariants =
                  Array.isArray(
                    product.variants
                  )
                    ? product.variants.filter(
                        (variant) =>
                          variant.active !==
                          false
                      )
                    : [];

                const firstVariant =
                  activeVariants[0];

                const image =
                  product.images?.[0];

                return (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-[#E7E4DC] bg-white p-4"
                  >
                    <div className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5F3EC]">
                        {image?.url ? (
                          <img
                            src={image.url}
                            alt={
                              image.alt ||
                              product.name
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
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-sm font-bold text-[#1F1F1F]">
                              {
                                product.name
                              }
                            </h2>

                            <p className="mt-1 text-xs text-[#68912B]">
                              {product.categoryName ||
                                "Uncategorized"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${getStatusClasses(
                              product.active !==
                                false
                            )}`}
                          >
                            {product.active !==
                            false
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-[#B22625]">
                            {firstVariant
                              ? formatNaira(
                                  firstVariant.price
                                )
                              : "No price"}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${getStockClasses(
                              product.stockStatus
                            )}`}
                          >
                            {formatStockLabel(
                              product.stockStatus
                            )}
                          </span>

                          {product.isNew ? (
                            <span className="rounded-full bg-[#EDF4E4] px-2 py-1 text-[10px] font-bold text-[#68912B]">
                              NEW
                            </span>
                          ) : null}

                          {product.isHot ? (
                            <span className="rounded-full bg-[#FFF0F0] px-2 py-1 text-[10px] font-bold text-[#B22625]">
                              HOT
                            </span>
                          ) : null}

                          {product.featured ? (
                            <span className="rounded-full bg-[#F5F3EC] px-2 py-1 text-[10px] font-bold text-gray-600">
                              ★
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E7E4DC] pt-3">
                      <p className="text-xs text-gray-400">
                        {activeVariants.length}{" "}
                        {activeVariants.length ===
                        1
                          ? "active variant"
                          : "active variants"}
                      </p>

                      <Link
                        href={`/dashboard/admin/products/${product.id}`}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-[#B22625] px-4 text-xs font-bold text-white"
                      >
                        Edit
                        <ArrowRight
                          size={13}
                        />
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
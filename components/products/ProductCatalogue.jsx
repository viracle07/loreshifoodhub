"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import ProductPrice from "./ProductPrice";
import { formatPackageLabel } from "@/lib/products/product-utils";

function ProductCatalogueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const initialCategory =
    searchParams.get("category") || "all";

  const [category, setCategory] =
    useState(initialCategory);

  const [showNew, setShowNew] = useState(
    searchParams.get("new") === "true"
  );

  const [showHot, setShowHot] = useState(
    searchParams.get("hot") === "true"
  );

  const [showFeatured, setShowFeatured] =
    useState(
      searchParams.get("featured") ===
        "true"
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  function updateUrl({
    nextCategory = category,
    nextNew = showNew,
    nextHot = showHot,
    nextFeatured = showFeatured,
  }) {
    const params =
      new URLSearchParams();

    if (nextCategory !== "all") {
      params.set(
        "category",
        nextCategory
      );
    }

    if (nextNew) {
      params.set("new", "true");
    }

    if (nextHot) {
      params.set("hot", "true");
    }

    if (nextFeatured) {
      params.set(
        "featured",
        "true"
      );
    }

    const query =
      params.toString();

    router.replace(
      query
        ? `/products?${query}`
        : "/products",
      {
        scroll: false,
      }
    );
  }

  useEffect(() => {
    async function loadCatalogue() {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch("/api/products", {
            cache: "no-store",
          }),
          fetch("/api/categories", {
            cache: "no-store",
          }),
        ]);

        const productsData =
          await productsResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        if (
          !productsResponse.ok ||
          !productsData.success
        ) {
          throw new Error(
            productsData.error ||
              "Unable to load products."
          );
        }

        if (
          !categoriesResponse.ok ||
          !categoriesData.success
        ) {
          throw new Error(
            categoriesData.error ||
              "Unable to load categories."
          );
        }

        setProducts(
          productsData.products || []
        );

        setCategories(
          categoriesData.categories || []
        );
      } catch (err) {
        console.error(
          "Catalogue loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load catalogue."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCatalogue();
  }, []);

  const filteredProducts =
    useMemo(() => {
      const searchTerm =
        search.trim().toLowerCase();

      return products.filter(
        (product) => {
          if (
            product.active === false
          ) {
            return false;
          }

          if (
            product.stockStatus ===
            "discontinued"
          ) {
            return false;
          }

          if (
            category !== "all" &&
            product.categoryId !==
              category
          ) {
            return false;
          }

          if (
            showNew &&
            product.isNew !== true
          ) {
            return false;
          }

          if (
            showHot &&
            product.isHot !== true
          ) {
            return false;
          }

          if (
            showFeatured &&
            product.featured !== true
          ) {
            return false;
          }

          if (searchTerm) {
            const searchableText = [
              product.name,
              product.description,
              product.categoryName,
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
      category,
      showNew,
      showHot,
      showFeatured,
    ]);

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setShowNew(false);
    setShowHot(false);
    setShowFeatured(false);

    router.replace("/products", {
      scroll: false,
    });
  }

  const hasFilters =
    search.trim() ||
    category !== "all" ||
    showNew ||
    showHot ||
    showFeatured;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* HEADER */}
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
          Loreshi FoodHub
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl lg:text-5xl">
          Shop Our Products
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
          Browse quality foodstuff for your
          everyday needs.
        </p>
      </div>

      {/* SEARCH */}
      <div className="mt-8">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products..."
            className="w-full rounded-2xl border border-[#E7E4DC] bg-white py-4 pl-12 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4]"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="mt-6 rounded-2xl border border-[#E7E4DC] bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={18}
            className="text-[#68912B]"
          />

          <h2 className="text-sm font-bold text-[#1F1F1F]">
            Categories & Filters
          </h2>
        </div>

        {/* CATEGORIES */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => {
              setCategory("all");

              updateUrl({
                nextCategory: "all",
              });
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              category === "all"
                ? "bg-[#68912B] text-white"
                : "border border-[#E7E4DC] bg-white text-[#1F1F1F] hover:bg-[#EDF4E4]"
            }`}
          >
            All
          </button>

          {categories.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCategory(item.id);

                  updateUrl({
                    nextCategory:
                      item.id,
                  });
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === item.id
                    ? "bg-[#68912B] text-white"
                    : "border border-[#E7E4DC] bg-white text-[#1F1F1F] hover:bg-[#EDF4E4]"
                }`}
              >
                {item.name}
              </button>
            )
          )}
        </div>

        {/* MERCHANDISING FILTERS */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !showNew;

              setShowNew(next);

              updateUrl({
                nextNew: next,
              });
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              showNew
                ? "bg-[#B22625] text-white"
                : "border border-[#E7E4DC] bg-white text-[#1F1F1F] hover:bg-[#FFF3F3]"
            }`}
          >
            🆕 New
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !showHot;

              setShowHot(next);

              updateUrl({
                nextHot: next,
              });
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              showHot
                ? "bg-[#B22625] text-white"
                : "border border-[#E7E4DC] bg-white text-[#1F1F1F] hover:bg-[#FFF3F3]"
            }`}
          >
            🔥 Hot
          </button>

          <button
            type="button"
            onClick={() => {
              const next =
                !showFeatured;

              setShowFeatured(next);

              updateUrl({
                nextFeatured:
                  next,
              });
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              showFeatured
                ? "bg-[#B22625] text-white"
                : "border border-[#E7E4DC] bg-white text-[#1F1F1F] hover:bg-[#FFF3F3]"
            }`}
          >
            ⭐ Featured
          </button>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-[#F5F3EC] hover:text-[#1F1F1F]"
            >
              <X size={15} />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* RESULT COUNT */}
      {!loading && !error ? (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredProducts.length}{" "}
            {filteredProducts.length ===
            1
              ? "product"
              : "products"}
          </p>
        </div>
      ) : null}

      {/* ERROR */}
      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* LOADING */}
      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-[#E7E4DC] bg-white"
            >
              <div className="h-[150px] animate-pulse bg-[#F5F3EC] sm:h-[190px]" />

              <div className="space-y-3 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-[#F0EEE7]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#F0EEE7]" />
                <div className="h-5 w-1/2 animate-pulse rounded bg-[#F0EEE7]" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* PRODUCTS */}
      {!loading &&
      !error &&
      filteredProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {filteredProducts.map(
            (product) => {
              const variant =
                product.variants?.find(
                  (item) =>
                    item.active !==
                    false
                ) ||
                product.variants?.[0];

              const image =
                product.images?.[0];

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-[#E7E4DC] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="block"
                  >
                    <div className="relative h-[150px] overflow-hidden bg-[#F5F3EC] sm:h-[190px]">
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={
                            image.alt ||
                            product.name
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-4xl">
                            🛒
                          </span>
                        </div>
                      )}

                      <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                        {product.isHot ? (
                          <span className="rounded-full bg-[#B22625] px-2 py-1 text-[10px] font-bold text-white">
                            HOT
                          </span>
                        ) : null}

                        {product.isNew ? (
                          <span className="rounded-full bg-[#68912B] px-2 py-1 text-[10px] font-bold text-white">
                            NEW
                          </span>
                        ) : null}

                        {product.featured ? (
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#1F1F1F] shadow-sm">
                            ★
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#68912B] sm:text-xs">
                        {product.categoryName ||
                          "Foodstuff"}
                      </p>

                      <h3 className="mt-1 line-clamp-2 text-sm font-bold text-[#1F1F1F] sm:text-base">
                        {product.name}
                      </h3>

                      {variant ? (
                        <div className="mt-2">
                          <ProductPrice
                            price={
                              variant.price
                            }
                            packageLabel={formatPackageLabel(
                              variant
                            )}
                          />
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </article>
              );
            }
          )}
        </div>
      ) : null}

      {/* EMPTY */}
      {!loading &&
      !error &&
      filteredProducts.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[#D9D5C9] bg-[#FAF9F5] px-6 py-16 text-center">
          <div className="text-4xl">
            🔎
          </div>

          <h2 className="mt-4 text-lg font-bold text-[#1F1F1F]">
            No products found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Try another search term or remove
            some filters.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-xl bg-[#B22625] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8F1D1D]"
          >
            Clear Filters
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ProductCatalogueFallback() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-5 py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E7E4DC] border-t-[#B22625]" />
    </div>
  );
}

export default function ProductCatalogue() {
  return (
    <Suspense
      fallback={
        <ProductCatalogueFallback />
      }
    >
      <ProductCatalogueContent />
    </Suspense>
  );
}
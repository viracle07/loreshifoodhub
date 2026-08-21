"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import ProductPrice from "./ProductPrice";
import { formatPackageLabel } from "@/lib/products/product-utils";
import { useCart } from "@/components/cart/CartProvider";
import { useAuth } from "@/app/context/AuthContext";

export default function ProductDetails({
  product,
}) {
  const { addToCart } = useCart();
const { user } = useAuth();

  const activeVariants = useMemo(
    () =>
      (product.variants || []).filter(
        (variant) =>
          variant.active !== false
      ),
    [product.variants]
  );

  const productImages = useMemo(
    () =>
      (product.images || []).filter(
        (image) => image?.url
      ),
    [product.images]
  );

  const [selectedVariantId, setSelectedVariantId] =
    useState(
      activeVariants[0]?.id || ""
    );

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0);

  const [quantity, setQuantity] = useState(1);

  const [addedToCart, setAddedToCart] =
    useState(false);

  const selectedVariant =
    activeVariants.find(
      (variant) =>
        variant.id === selectedVariantId
    ) || activeVariants[0];

  const selectedImage =
    productImages[selectedImageIndex] ||
    productImages[0];

  const canBuy =
    product.stockStatus === "in_stock" &&
    Boolean(selectedVariant);

  function decreaseQuantity() {
    setQuantity((previous) =>
      Math.max(1, previous - 1)
    );
  }

  function increaseQuantity() {
    setQuantity((previous) =>
      Math.min(99, previous + 1)
    );
  }

  

 function handleAddToCart() {
  if (!user) {
    setAddedToCart(false);

    window.alert(
      "Please sign in to add products to your cart."
    );

    return;
  }

  if (!canBuy) {
    return;
  }

  addToCart({
    product,
    variant: selectedVariant,
    quantity,
  });

  setAddedToCart(true);

  window.setTimeout(() => {
    setAddedToCart(false);
  }, 2000);
}

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* =========================================
          PRODUCT IMAGE GALLERY
      ========================================= */}
      <div>
        <div className="relative overflow-hidden rounded-3xl border border-[#E7E4DC] bg-white">
          <div className="aspect-square bg-[#F5F3EC]">
            {selectedImage?.url ? (
              <img
                src={selectedImage.url}
                alt={
                  selectedImage.alt ||
                  product.name ||
                  "Loreshi FoodHub product"
                }
                className="h-full w-full object-cover transition duration-300"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-7xl">
                  🛒
                </span>
              </div>
            )}
          </div>

          {/* BADGES */}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.isHot ? (
              <span className="rounded-full bg-[#B22625] px-3 py-1.5 text-xs font-bold text-white">
                🔥 HOT
              </span>
            ) : null}

            {product.isNew ? (
              <span className="rounded-full bg-[#68912B] px-3 py-1.5 text-xs font-bold text-white">
                🆕 NEW
              </span>
            ) : null}

            {product.featured ? (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1F1F1F] shadow-md">
                ⭐ FEATURED
              </span>
            ) : null}
          </div>
        </div>

        {/* THUMBNAILS */}
        {productImages.length > 1 ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {productImages.map(
              (image, index) => {
                const selected =
                  index ===
                  selectedImageIndex;

                return (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImageIndex(
                        index
                      )
                    }
                    aria-label={`View product image ${
                      index + 1
                    }`}
                    aria-current={
                      selected
                        ? "true"
                        : undefined
                    }
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#F5F3EC] transition sm:h-24 sm:w-24 ${
                      selected
                        ? "border-[#68912B] ring-2 ring-[#EDF4E4]"
                        : "border-[#E7E4DC] hover:border-[#68912B]"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={
                        image.alt ||
                        `${product.name} image ${
                          index + 1
                        }`
                      }
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              }
            )}
          </div>
        ) : null}
      </div>

      {/* =========================================
          PRODUCT INFORMATION
      ========================================= */}
      <div className="flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#68912B]">
          {product.categoryName ||
            "Foodstuff"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
          {product.name}
        </h1>

        {product.description ? (
          <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base">
            {product.description}
          </p>
        ) : null}

        {/* VARIANTS */}
        {activeVariants.length > 0 ? (
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1F1F1F]">
                Choose package
              </h2>

              <span className="text-xs text-gray-500">
                {activeVariants.length}{" "}
                {activeVariants.length === 1
                  ? "option"
                  : "options"}
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {activeVariants.map(
                (variant) => {
                  const selected =
                    variant.id ===
                    selectedVariant?.id;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() =>
                        setSelectedVariantId(
                          variant.id
                        )
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#68912B] bg-[#EDF4E4] ring-2 ring-[#EDF4E4]"
                          : "border-[#E7E4DC] bg-white hover:border-[#68912B]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1F1F1F]">
                            {variant.label ||
                              formatPackageLabel(
                                variant
                              )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatPackageLabel(
                              variant
                            )}
                          </p>
                        </div>

                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-[#68912B] bg-[#68912B]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selected ? (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          ) : null}
                        </span>
                      </div>

                      <p className="mt-3 text-lg font-bold text-[#B22625]">
                        ₦
                        {Number(
                          variant.price || 0
                        ).toLocaleString(
                          "en-NG"
                        )}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-[#E7E4DC] bg-[#FAF9F5] p-4 text-sm text-gray-600">
            This product currently has no
            available package option.
          </div>
        )}

        {/* PRICE */}
        {selectedVariant ? (
          <div className="mt-7 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E7E4DC]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              Selected price
            </p>

            <div className="mt-2">
              <ProductPrice
                price={selectedVariant.price}
                packageLabel={formatPackageLabel(
                  selectedVariant
                )}
              />
            </div>
          </div>
        ) : null}

        {/* STOCK */}
        <div className="mt-5 flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              product.stockStatus === "in_stock"
                ? "bg-[#68912B]"
                : "bg-[#B22625]"
            }`}
          />

          <span className="text-sm font-medium text-gray-600">
            {product.stockStatus ===
            "in_stock"
              ? "In stock"
              : product.stockStatus ===
                  "out_of_stock"
                ? "Currently out of stock"
                : "Currently unavailable"}
          </span>
        </div>

        {/* QUANTITY + CART */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex h-12 items-center justify-between rounded-xl border border-[#E7E4DC] bg-white sm:w-36">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={!canBuy}
              className="flex h-full w-11 items-center justify-center text-lg font-semibold text-gray-600 transition hover:bg-[#F5F3EC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            <span className="text-sm font-bold text-[#1F1F1F]">
              {quantity}
            </span>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={!canBuy}
              className="flex h-full w-11 items-center justify-center text-lg font-semibold text-gray-600 transition hover:bg-[#F5F3EC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canBuy}
            className={`h-12 flex-1 rounded-xl px-6 text-sm font-bold text-white transition ${
              addedToCart
                ? "bg-[#68912B]"
                : "bg-[#B22625] hover:bg-[#8F1D1D]"
            } disabled:cursor-not-allowed disabled:bg-gray-300`}
          >
            {addedToCart
              ? "✓ Added to Cart"
              : canBuy
                ? "Add to Cart"
                : "Unavailable"}
          </button>
        </div>

        {/* CATEGORY */}
        <div className="mt-8 border-t border-[#E7E4DC] pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            Category
          </p>

          <Link
            href={`/products?category=${encodeURIComponent(
              product.categoryId || ""
            )}`}
            className="mt-2 inline-block text-sm font-semibold text-[#68912B] hover:text-[#B22625]"
          >
            {product.categoryName ||
              "Foodstuff"}
          </Link>
        </div>
      </div>
    </div>
  );
}
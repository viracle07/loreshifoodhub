"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import ProductPrice from "./ProductPrice";
import { formatPackageLabel } from "@/lib/products/product-utils";

const AUTO_SLIDE_MS = 5000;

export default function HotProductsSlider({
  products = [],
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    function updateVisibleCount() {
      if (window.innerWidth >= 1024) {
        setVisibleCount(4);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    }

    updateVisibleCount();

    window.addEventListener(
      "resize",
      updateVisibleCount
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateVisibleCount
      );
    };
  }, []);

  const validProducts = products.filter(
    (product) =>
      product?.active !== false &&
      product?.stockStatus !== "discontinued"
  );

  const actualVisibleCount = Math.min(
    visibleCount,
    validProducts.length || 1
  );

  const maxIndex = Math.max(
    0,
    validProducts.length - actualVisibleCount
  );

  const nextSlide = useCallback(() => {
    setCurrentIndex((index) => {
      if (index >= maxIndex) {
        return 0;
      }

      return index + 1;
    });
  }, [maxIndex]);

  const previousSlide = useCallback(() => {
    setCurrentIndex((index) => {
      if (index <= 0) {
        return maxIndex;
      }

      return index - 1;
    });
  }, [maxIndex]);

  useEffect(() => {
    if (maxIndex <= 0) {
      return;
    }

    const timer = window.setInterval(
      nextSlide,
      AUTO_SLIDE_MS
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [nextSlide, maxIndex]);

  useEffect(() => {
    setCurrentIndex((index) =>
      Math.min(index, maxIndex)
    );
  }, [maxIndex]);

  if (!validProducts.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#D9D5C9] bg-[#FAF9F5] p-10 text-center">
        <p className="text-sm text-gray-500">
          Hot products will appear here soon.
        </p>
      </div>
    );
  }

  const cardWidth =
    100 / actualVisibleCount;

  const trackWidth =
    (validProducts.length /
      actualVisibleCount) *
    100;

  const translateX =
    currentIndex * cardWidth;

  return (
    <div className="relative w-full">
      {/* Carousel viewport */}
      <div className="overflow-hidden">
        {/* Carousel track */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${trackWidth}%`,
            transform: `translateX(-${translateX}%)`,
          }}
        >
          {validProducts.map((product) => {
            const variant =
              product?.variants?.find(
                (item) => item?.active !== false
              ) ||
              product?.variants?.[0];

            const image =
              product?.images?.[0];

            return (
              <div
                key={product.id}
                className="shrink-0 px-2"
                style={{
                  width: `${cardWidth}%`,
                }}
              >
                <article className="h-full overflow-hidden rounded-2xl border border-[#E7E4DC] bg-white shadow-sm">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block h-full"
                  >
                    {/* Product image */}
                    <div className="relative h-[150px] overflow-hidden bg-[#F5F3EC] sm:h-[180px] lg:aspect-[4/3] lg:h-auto">
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={
                            image.alt ||
                            product.name ||
                            "Loreshi FoodHub product"
                          }
                          className="h-full w-full  max-md:w-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center">
                          <span
                            className="text-5xl"
                            aria-hidden="true"
                          >
                            🛒
                          </span>

                          <span className="mt-2 text-xs text-gray-400">
                            Product image coming soon
                          </span>
                        </div>
                      )}

                      {/* Hot badge */}
                      <span className="absolute left-3 top-3 rounded-full bg-[#B22625] px-3 py-1 text-xs font-bold text-white">
                        HOT
                      </span>
                    </div>

                    {/* Product information */}
                    <div className="p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#68912B]">
                        {product.categoryName ||
                          "Foodstuff"}
                      </p>

                      <h3 className="mt-1 line-clamp-2 text-base font-bold text-[#1F1F1F] sm:text-lg">
                        {product.name}
                      </h3>

                      {variant ? (
                        <div className="mt-3">
                          <ProductPrice
                            price={variant.price}
                            packageLabel={formatPackageLabel(
                              variant
                            )}
                          />
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* Previous button */}
      {maxIndex > 0 ? (
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous hot products"
          className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E4DC] bg-white text-2xl text-[#1F1F1F] shadow-lg transition hover:bg-[#EDF4E4] focus:outline-none focus:ring-2 focus:ring-[#68912B]"
        >
          <span aria-hidden="true">
            ‹
          </span>
        </button>
      ) : null}

      {/* Next button */}
      {maxIndex > 0 ? (
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next hot products"
          className="absolute right-0 top-1/2 z-20 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E4DC] bg-white text-2xl text-[#1F1F1F] shadow-lg transition hover:bg-[#EDF4E4] focus:outline-none focus:ring-2 focus:ring-[#68912B]"
        >
          <span aria-hidden="true">
            ›
          </span>
        </button>
      ) : null}

      {/* Slide indicators */}
      {maxIndex > 0 ? (
        <div className="mt-5 flex justify-center gap-2">
          {Array.from({
            length: maxIndex + 1,
          }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                setCurrentIndex(index)
              }
              aria-label={`Go to hot products position ${
                index + 1
              }`}
              aria-current={
                currentIndex === index
                  ? "true"
                  : undefined
              }
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "w-6 bg-[#B22625]"
                  : "w-2 bg-[#D9D5C9]"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
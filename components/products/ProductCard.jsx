import Link from "next/link";

import ProductPrice from "./ProductPrice";
import { formatPackageLabel } from "@/lib/products/product-utils";

export default function ProductCard({
  product,
}) {
  const activeVariants = Array.isArray(product?.variants)
    ? product.variants.filter((variant) => variant.active !== false)
    : [];

  const firstVariant = activeVariants[0];

  const image = product?.images?.[0];

  const isOutOfStock =
    product?.stockStatus === "out_of_stock" ||
    product?.stockStatus === "discontinued";

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#E7E4DC] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/products/${product.slug}`}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-[#F5F3EC]">
          {image?.url ? (
            <img
              src={image.url}
              alt={
                image.alt ||
                product.name ||
                "Loreshi FoodHub product"
              }
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-400">
              Product image coming soon
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.isNew ? (
              <span className="rounded-full bg-[#68912B] px-3 py-1 text-xs font-semibold text-white">
                New
              </span>
            ) : null}

            {product.isHot ? (
              <span className="rounded-full bg-[#B22625] px-3 py-1 text-xs font-semibold text-white">
                Hot
              </span>
            ) : null}
          </div>

          {isOutOfStock ? (
            <div className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-center text-xs font-semibold text-white">
              Out of stock
            </div>
          ) : null}
        </div>

        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#68912B]">
            {product.categoryName || "Foodstuff"}
          </p>

          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-[#1F1F1F]">
            {product.name}
          </h3>

          {firstVariant ? (
            <div className="mt-3">
              <ProductPrice
                price={firstVariant.price}
                packageLabel={formatPackageLabel(firstVariant)}
              />
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
import Link from "next/link";

import ProductPrice from "./ProductPrice";
import { formatPackageLabel } from "@/lib/products/product-utils";

export default function RelatedProducts({
  products = [],
}) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-[#E7E4DC] pt-12 sm:mt-20 sm:pt-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#68912B]">
          More from Loreshi
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
          You May Also Like
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          More quality foodstuff you may enjoy.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const variant =
            product.variants?.find(
              (item) => item.active !== false
            ) || product.variants?.[0];

          const image = product.images?.[0];

          return (
            <article
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-[#E7E4DC] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Link
                href={`/products/${product.slug}`}
                className="block"
              >
                <div className="relative h-[140px] overflow-hidden bg-[#F5F3EC] sm:h-[180px]">
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

                  <div className="absolute left-2 top-2 flex gap-1.5">
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
          );
        })}
      </div>
    </section>
  );
}
import Link from "next/link";

import ProductGrid from "./ProductGrid";

export default function ProductSection({
  title,
  description,
  products,
  href,
  linkLabel = "View all",
}) {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#68912B]">
              Loreshi FoodHub
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
              {title}
            </h2>

            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>

          {href ? (
            <Link
              href={href}
              className="hidden shrink-0 text-sm font-semibold text-[#B22625] transition hover:text-[#8F1D1D] sm:block"
            >
              {linkLabel}
            </Link>
          ) : null}
        </div>

        <ProductGrid products={products} />

        {href ? (
          <div className="mt-6 text-center sm:hidden">
            <Link
              href={href}
              className="text-sm font-semibold text-[#B22625]"
            >
              {linkLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
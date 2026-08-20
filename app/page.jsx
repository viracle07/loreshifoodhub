import ProductSection from "@/components/products/ProductSection";
import HotProductsSlider from "@/components/products/HotProductsSlider";

import {
  getFeaturedProducts,
  getHotProducts,
  getNewProducts,
} from "@/lib/products/product-service";

export default async function Home() {
  const [
    newProducts,
    featuredProducts,
    hotProducts,
  ] = await Promise.all([
    getNewProducts(8),
    getFeaturedProducts(8),
    getHotProducts(8),
  ]);

  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      {/* =========================================
          HERO SECTION
      ========================================= */}
      <section className="flex min-h-[70vh] items-center justify-center px-5 py-16 sm:px-6 lg:min-h-[75vh]">
        <div className="w-full max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF4E4]">
            <span
              className="text-2xl"
              aria-hidden="true"
            >
              🍎
            </span>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#68912B]">
            Loreshi FoodHub
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-[#1F1F1F] sm:text-5xl lg:text-6xl">
            Quality foodstuff.
            <br />
            <span className="text-[#B22625]">
              Smiles served daily.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            A modern foodstuff marketplace for quality
            garri, oil, fish, groundnuts and other
            everyday food items.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#new-products"
              className="rounded-full bg-[#B22625] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8F1D1D]"
            >
              Shop New Products
            </a>

            <a
              href="#products"
              className="rounded-full border border-[#E7E4DC] bg-white px-6 py-3 text-sm font-semibold text-[#68912B] transition hover:bg-[#EDF4E4]"
            >
              Browse Products
            </a>
          </div>
        </div>
      </section>

      {/* =========================================
          HOT PRODUCTS
      ========================================= */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mb-7 sm:mb-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
              Popular right now
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
              🔥 Hot Products
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Take a look at some of the products our
              customers love.
            </p>
          </div>

         <HotProductsSlider products={hotProducts} />
        </div>
      </section>

      {/* =========================================
          NEW PRODUCTS
      ========================================= */}
      <div id="new-products">
        <ProductSection
          title="New Products"
          description="Fresh additions to the Loreshi FoodHub collection."
          products={newProducts}
          href="/products?new=true"
          linkLabel="See all new products"
        />
      </div>

      {/* =========================================
          FEATURED PRODUCTS
      ========================================= */}
      <div id="products">
        <ProductSection
          title="Featured Products"
          description="Selected foodstuff available for your everyday needs."
          products={featuredProducts}
          href="/products"
          linkLabel="Shop all products"
        />
      </div>
    </main>
  );
}
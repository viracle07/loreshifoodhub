import ProductSection from "@/components/products/ProductSection";
import HotProductsSlider from "@/components/products/HotProductsSlider";
import AboutSection from "@/components/home/AboutSection";
import HowItWorks from "@/components/home/HowItWorks";
import CustomerReviews from "@/components/home/CustomerReviews";
import ContactSection from "@/components/home/ContactSection";

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
      <section className="relative overflow-hidden bg-[#FFFDF8]">
        {/* Decorative background graphics */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#EDF4E4] opacity-70 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#FFF0D8] opacity-70 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[8%] top-24 text-5xl opacity-20"
        >
          🌿
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[45%] top-16 text-3xl opacity-20"
        >
          ✦
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-24 left-[42%] text-4xl opacity-20"
        >
          🍃
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">

            {/* =========================================
          LEFT CONTENT
      ========================================= */}
            <div className="relative z-10 max-w-2xl">

              {/* SMALL BADGE */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8DFB9] bg-white px-4 py-2 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EDF4E4]">
                  🌿
                </span>

                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#68912B]">
                  100% Quality • Natural • Fresh
                </span>
              </div>

              {/* HEADLINE */}
              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-[#1F1F1F] sm:text-5xl lg:text-6xl xl:text-7xl">
                Quality foodstuff.
                <br />

                <span className="text-[#B22625]">
                  For everyday life.
                </span>
              </h1>

              {/* DESCRIPTION */}
              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                Premium Nigerian foodstuff sourced with care
                and delivered conveniently to your doorstep.
              </p>

              {/* CTA BUTTONS */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <a
                  href="#products"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#8F1D1D] hover:shadow-md"
                >
                  🛒 Shop Now
                </a>

                <a
                  href="/products"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#D8D5C9] bg-white px-7 text-sm font-bold text-[#68912B] transition hover:border-[#68912B] hover:bg-[#EDF4E4]"
                >
                  Explore Products
                  <span aria-hidden="true">→</span>
                </a>

              </div>

              {/* TRUST FEATURES */}
              <div className="mt-9 grid max-w-xl grid-cols-3 gap-3 border-t border-[#E7E4DC] pt-6">

                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDF4E4]">
                    ✓
                  </div>

                  <p className="mt-2 text-xs font-bold text-[#1F1F1F] sm:text-sm">
                    Quality Products
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-gray-500 sm:text-xs">
                    Sourced with care
                  </p>
                </div>

                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF7E6]">
                    ⚡
                  </div>

                  <p className="mt-2 text-xs font-bold text-[#1F1F1F] sm:text-sm">
                    Easy Ordering
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-gray-500 sm:text-xs">
                    Quick & secure
                  </p>
                </div>

                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0F0]">
                    🚚
                  </div>

                  <p className="mt-2 text-xs font-bold text-[#1F1F1F] sm:text-sm">
                    Safe Delivery
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-gray-500 sm:text-xs">
                    To your doorstep
                  </p>
                </div>

              </div>
            </div>

            {/* =========================================
          HERO FOOD VISUAL
      ========================================= */}
            <div className="relative -mt-8 sm:-mt-10 lg:-mt-14">

              {/* Soft background shape */}
              <div
                aria-hidden="true"
                className="absolute inset-6 rounded-[4rem] bg-[#F4E8CF] opacity-80 blur-sm"
              />

              {/* Decorative leaves */}
              <div
                aria-hidden="true"
                className="absolute -left-2 top-10 z-20 text-4xl opacity-70 sm:left-0 sm:text-5xl"
              >
                🌿
              </div>

              <div
                aria-hidden="true"
                className="absolute -right-2 bottom-20 z-20 text-4xl opacity-70 sm:right-0 sm:text-5xl"
              >
                🌶️
              </div>

              {/* IMAGE */}
              <div className="relative z-10 overflow-hidden rounded-[2.5rem] border border-[#E7E4DC] bg-[#F5F3EC] shadow-2xl">
                <img
                  src="/images/foodhub-hero.png"
                  alt="Quality Nigerian foodstuff from Loreshi FoodHub"
                  className="h-full w-full object-cover"
                />



              </div>


            </div>
          </div>
        </div>

        {/* Organic bottom edge */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-3 w-full bg-[#68912B]"
        />
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

      <AboutSection />

      <HowItWorks />

      <CustomerReviews />

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


      <ContactSection />
      
    </main>
  );
}
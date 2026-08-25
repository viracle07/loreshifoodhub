import Link from "next/link";
import {
  Search,
  ShoppingCart,
  CreditCard,
  Truck,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Browse",
    description:
      "Explore quality Nigerian foodstuff available on Loreshi FoodHub.",
  },
  {
    number: "02",
    icon: ShoppingCart,
    title: "Choose",
    description:
      "Select your preferred product, package size and quantity, then add it to your cart.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Checkout",
    description:
      "Review your order, provide your delivery details and complete checkout.",
  },
  {
    number: "04",
    icon: Truck,
    title: "Get Delivered",
    description:
      "We prepare your order and arrange delivery to your chosen location.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-y border-[#E7E4DC] bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B22625]">
            Simple & Convenient
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1F1F1F] sm:text-4xl">
            How Loreshi FoodHub works
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            Getting your favourite foodstuff is simple.
            Browse our products, place your order and
            let us take care of the rest.
          </p>
        </div>

        {/* STEPS */}
        <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative text-center lg:px-6"
              >
                {/* CONNECTING LINE */}
                {index < steps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute left-[calc(50%+52px)] right-[calc(-50%+52px)] top-[30px] hidden h-px bg-[#E7E4DC] lg:block"
                  />
                ) : null}

                {/* ICON */}
                <div className="relative z-10 mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#E7E4DC] bg-[#FFFDF8] shadow-sm">
                  <Icon
                    size={23}
                    strokeWidth={2}
                    className="text-[#68912B]"
                  />
                </div>

                {/* NUMBER */}
                <p className="mt-5 text-[11px] font-black tracking-[0.18em] text-[#B22625]">
                  {step.number}
                </p>

                {/* TITLE */}
                <h3 className="mt-2 text-base font-bold text-[#1F1F1F]">
                  {step.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-6 text-sm font-bold text-white transition hover:bg-[#8F1D1D] focus:outline-none focus:ring-2 focus:ring-[#B22625] focus:ring-offset-2"
          >
            Start Shopping
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
import Image from "next/image";
import Link from "next/link";
import {
    ShieldCheck,
    ShoppingCart,
    Truck,
    ArrowRight,
} from "lucide-react";

export default function AboutSection() {
    return (
        <section className="border-y border-[#E7E4DC] bg-[#FFFDF8] py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">

                    {/* =========================================
              LOGO SIDE
          ========================================= */}
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <div className="relative w-full max-w-[360px]">
                            <Image
                                src="/loreshi-logo.png"
                                alt="Loreshi FoodHub"
                                width={600}
                                height={600}
                                priority={false}
                                className="h-auto w-full object-contain"
                            />
                        </div>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-gray-500 sm:text-base">
                            Quality Nigerian foodstuff, made easy
                            for everyday living.
                        </p>
                    </div>

                    {/* =========================================
              ABOUT CONTENT
          ========================================= */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68912B]">
                            About Loreshi FoodHub
                        </p>

                        <div className="mt-3 h-1 w-12 rounded-full bg-[#68912B]" />

                        <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-[#1F1F1F] sm:text-4xl lg:text-5xl">
                            Bringing the taste of home
                            <br />

                            <span className="text-[#B22625]">
                                closer to you.
                            </span>
                        </h2>

                        {/* BRAND DESCRIPTION */}
                        <div className="mt-6 max-w-3xl space-y-4 text-sm leading-7 text-gray-600 sm:text-base">
                            <p>
                                <span className="font-bold text-[#1F1F1F]">
                                    Loreshi FoodHub
                                </span>{" "}
                                is a premium indigenous foodstuff brand
                                dedicated to sourcing, processing,
                                packaging, and delivering quality Nigerian
                                food products.
                            </p>

                            <p>
                                We make traditional foods more convenient,
                                hygienic, and accessible while preserving
                                the authentic taste of home — serving
                                customers in Nigeria and the diaspora.
                            </p>
                        </div>

                        {/* =========================================
                BENEFITS
            ========================================= */}
                        <div className="mt-9 grid border-y border-[#E7E4DC] sm:grid-cols-3">

                            {/* QUALITY */}
                            <div className="py-6 sm:pr-5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EDF4E4]">
                                    <ShieldCheck
                                        size={21}
                                        className="text-[#68912B]"
                                    />
                                </div>

                                <h3 className="mt-4 text-sm font-bold text-[#1F1F1F]">
                                    Quality You Can Trust
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    Carefully selected foodstuff for
                                    your everyday needs.
                                </p>
                            </div>

                            {/* ORDERING */}
                            <div className="border-t border-[#E7E4DC] py-6 sm:border-l sm:border-t-0 sm:px-5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF7E6]">
                                    <ShoppingCart
                                        size={20}
                                        className="text-[#A66A00]"
                                    />
                                </div>

                                <h3 className="mt-4 text-sm font-bold text-[#1F1F1F]">
                                    Easy Ordering
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    Browse, choose and order from
                                    wherever you are.
                                </p>
                            </div>

                            {/* DELIVERY */}
                            <div className="border-t border-[#E7E4DC] py-6 sm:border-l sm:border-t-0 sm:pl-5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0F0]">
                                    <Truck
                                        size={20}
                                        className="text-[#B22625]"
                                    />
                                </div>

                                <h3 className="mt-4 text-sm font-bold text-[#1F1F1F]">
                                    Reliable Delivery
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    Get your order delivered conveniently
                                    to your doorstep.
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-8">
                            <Link
                                href="/products"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-6 text-sm font-bold text-white transition hover:bg-[#8F1D1D] focus:outline-none focus:ring-2 focus:ring-[#B22625] focus:ring-offset-2"
                            >
                                Explore Our Products

                                <ArrowRight size={17} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
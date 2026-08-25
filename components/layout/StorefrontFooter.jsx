import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

function InstagramIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14 8h3V4h-3c-3.314 0-5 1.686-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.553.447-1 1-1Z" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-3.77A4.83 4.83 0 0 1 15.74 2h-3.44v13.12a2.91 2.91 0 1 1-2.91-2.91c.24 0 .48.03.7.09V8.79a6.3 6.3 0 1 0 5.65 6.28V8.46a8.23 8.23 0 0 0 4.82 1.55V6.57c-.33.08-.65.12-.97.12Z" />
    </svg>
  );
}

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/loreshi_foodhub",
    icon: InstagramIcon,
    className:
      "border-[#E1306C] text-[#E1306C] hover:bg-[#E1306C] hover:text-[#FFFFFF]",
  },
  {
    name: "Facebook",
    href: "https://web.facebook.com/loreshifoodhub",
    icon: FacebookIcon,
    className:
      "border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-[#FFFFFF]",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@loreshi_foodhub24",
    icon: TikTokIcon,
    className:
      "border-[#FFFFFF] text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#1F1F1F]",
  },
];

export default function StorefrontFooter() {
  return (
    <footer className="bg-[#1F1F1F] text-white">

      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1fr]">

          {/* BRAND */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white">
                <Image
                  src="/loreshi-logo.png"
                  alt="Loreshi FoodHub"
                  width={100}
                  height={100}
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-base font-black">
                  Loreshi
                </p>

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B8D58C]">
                  FoodHub
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
              Quality Nigerian foodstuff, carefully
              sourced, packaged and delivered to make
              everyday food shopping easier.
            </p>

            {/* SOCIALS */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Loreshi FoodHub on ${social.name}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${social.className}`}
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* SHOP */}
          <div>
            <h3 className="text-sm font-bold">
              Shop
            </h3>

            <nav className="mt-5 flex flex-col gap-3">
              <Link
                href="/products"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                All Products
              </Link>

              <Link
                href="/products?new=true"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                New Products
              </Link>

              <Link
                href="/products?hot=true"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Hot Products
              </Link>

              <Link
                href="/cart"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Shopping Cart
              </Link>
            </nav>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-sm font-bold">
              Loreshi
            </h3>

            <nav className="mt-5 flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/products"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Products
              </Link>

              <Link
                href="/auth"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                My Account
              </Link>

              <a
                href="https://wa.me/2348056710073?text=Hello%20Loreshi%20FoodHub%2C%20I%20need%20help."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-white"
              >
                Contact Us
                <ArrowUpRight size={13} />
              </a>
            </nav>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-bold">
              Contact
            </h3>

            <div className="mt-5 space-y-4">

              <a
                href="tel:+2348056710073"
                className="flex items-start gap-3 text-sm text-gray-400 transition hover:text-white"
              >
                <Phone
                  size={17}
                  className="mt-0.5 shrink-0 text-[#B8D58C]"
                />

                <span>
                  0805 671 0073
                </span>
              </a>

              <a
                href="mailto:loreshifoodhub24@gmail.com"
                className="flex items-start gap-3 text-sm text-gray-400 transition hover:text-white"
              >
                <Mail
                  size={17}
                  className="mt-0.5 shrink-0 text-[#B8D58C]"
                />

                <span className="break-all">
                  loreshifoodhub24@gmail.com
                </span>
              </a>

              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0 text-[#B8D58C]"
                />

                <span>
                  Nigeria
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                Opening Hours
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                8:00 AM – 5:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
     <div className="border-t border-white/10">
  <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

    {/* COPYRIGHT */}
    <p className="text-xs text-gray-500">
      © {new Date().getFullYear()} Loreshi FoodHub.
      All rights reserved.
    </p>
    
      <a
        href="https://veeracle.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-[#68912B]/40 bg-[#68912B]/10 px-4 py-2 text-xs font-bold text-[#B8D58C] transition duration-200 hover:border-[#68912B] hover:bg-[#68912B] hover:text-white"
      >
        Crafted by
        <span className="text-white">
          Veeracle
        </span>

        <ArrowUpRight size={13} />
      </a>

    {/* BOTTOM LINKS */}
    <div className="flex flex-wrap items-center gap-3">

      <span className="hidden text-xs text-gray-600 sm:inline">
        Quality foodstuff. Delivered with care.
      </span>


    </div>
  </div>
</div>
    </footer>
  );
}
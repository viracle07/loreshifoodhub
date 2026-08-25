import Link from "next/link";
import {
    MessageCircle,
    Phone,
    Mail,
    Clock3,
    Instagram,
    Facebook,
    ArrowRight,
} from "lucide-react";

const contactOptions = [
    {
        icon: MessageCircle,
        title: "WhatsApp",
        description:
            "Chat with us directly for enquiries, product information and order support.",
        label: "Chat on WhatsApp",
        href: "https://wa.me/2348056710073?text=Hello%20Loreshi%20FoodHub%2C%20I%20would%20like%20to%20make%20an%20enquiry.",
        iconClass: "text-[#68912B]",
        bgClass: "bg-[#EDF4E4]",
        external: true,
    },
    {
        icon: Phone,
        title: "Call Us",
        description:
            "Have a question? Give us a call and our team will be happy to assist you.",
        label: "0805 671 0073",
        href: "tel:+2348056710073",
        iconClass: "text-[#B22625]",
        bgClass: "bg-[#FFF0F0]",
        external: false,
    },
    {
        icon: Mail,
        title: "Email",
        description:
            "Send us a message and we'll get back to you as soon as possible.",
        label: "loreshifoodhub24@gmail.com",
        href: "mailto:loreshifoodhub24@gmail.com",
        iconClass: "text-[#A66A00]",
        bgClass: "bg-[#FFF7E6]",
        external: false,
    },
];

const socialLinks = [
    {
        name: "Instagram",
        href: "https://www.instagram.com/loreshi_foodhub",
        icon: InstagramIcon,
        className:
            "border-[#E1306C]/30 bg-[#FCEEF4] text-[#E1306C] hover:border-[#E1306C] hover:bg-[#E1306C] hover:text-white",
    },
    {
        name: "Facebook",
        href: "https://web.facebook.com/loreshifoodhub",
        icon: FacebookIcon,
        className:
            "border-[#1877F2]/30 bg-[#EEF5FF] text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white",
    },
    {
        name: "TikTok",
        href: "https://www.tiktok.com/@loreshi_foodhub24",
        icon: TikTokIcon,
        className:
            "border-[#1F1F1F] bg-[#F3F3F3] text-[#1F1F1F] hover:border-[#000000] hover:bg-[#000000] hover:!text-[#FFFFFF]",
    },
];

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

export default function ContactSection() {
    return (
        <section className="border-t border-[#E7E4DC] bg-[#FAF9F5] py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

                {/* HEADER */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68912B]">
                        We're Here To Help
                    </p>

                    <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1F1F1F] sm:text-4xl">
                        Have a question?
                        <br />

                        <span className="text-[#B22625]">
                            Let's talk.
                        </span>
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
                        Whether you need help choosing a product,
                        have a question about an order, or simply
                        want to know more about Loreshi FoodHub,
                        we're happy to hear from you.
                    </p>
                </div>

                {/* CONTACT OPTIONS */}
                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {contactOptions.map((option) => {
                        const Icon = option.icon;

                        return (
                            <div
                                key={option.title}
                                className="rounded-3xl border border-[#E7E4DC] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7"
                            >
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-full ${option.bgClass}`}
                                >
                                    <Icon
                                        size={21}
                                        className={option.iconClass}
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-[#1F1F1F]">
                                    {option.title}
                                </h3>

                                <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                                    {option.description}
                                </p>

                                <a
                                    href={option.href}
                                    target={
                                        option.external
                                            ? "_blank"
                                            : undefined
                                    }
                                    rel={
                                        option.external
                                            ? "noopener noreferrer"
                                            : undefined
                                    }
                                    className="mt-5 inline-flex max-w-full items-center gap-2 text-sm font-bold text-[#B22625] transition hover:text-[#8F1D1D]"
                                >
                                    <span className="truncate">
                                        {option.label}
                                    </span>

                                    <ArrowRight
                                        size={15}
                                        className="shrink-0"
                                    />
                                </a>
                            </div>
                        );
                    })}
                </div>

                {/* OPENING HOURS */}
                <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-[#E7E4DC] bg-white px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDF4E4]">
                        <Clock3
                            size={19}
                            className="text-[#68912B]"
                        />
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                            Opening Hours
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#1F1F1F]">
                            8:00 AM – 5:00 PM
                        </p>
                    </div>
                </div>

                {/* SOCIAL MEDIA */}
                <div className="mt-10 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                        Follow Loreshi FoodHub
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        {socialLinks.map((social) => {
                            const SocialIcon = social.icon;

                            return (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Follow Loreshi FoodHub on ${social.name}`}
                                    className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition ${social.className}`}
                                >
                                    <SocialIcon size={18} />
                                    {social.name}
                                </a>
                            );
                        })}
                    </div>
                </div>

                {/* FINAL SHOPPING CTA */}
                <div className="mt-12 overflow-hidden rounded-3xl bg-[#1F1F1F] px-6 py-10 text-center sm:px-10">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B8D58C]">
                        Ready to shop?
                    </p>

                    <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                        Get quality foodstuff delivered to you.
                    </h3>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-300">
                        Browse our collection and find the everyday
                        food products you need.
                    </p>

                    <Link
                        href="/products"
                        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-6 text-sm font-bold text-white transition hover:bg-[#8F1D1D] focus:outline-none focus:ring-2 focus:ring-[#B22625] focus:ring-offset-2 focus:ring-offset-[#1F1F1F]"
                    >
                        Browse Products
                        <ArrowRight size={17} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
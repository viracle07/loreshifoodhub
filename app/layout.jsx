import "./globals.css";

import { FirebaseProvider } from "@/lib/firebase/client-provider";
import { AuthProvider } from "@/app/context/AuthContext";
import StructuredData from "@/components/seo/StructuredData";

import StorefrontHeader from "@/components/layout/StorefrontHeader";
import StorefrontFooter from "@/components/layout/StorefrontFooter";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { CartProvider } from "@/components/cart/CartProvider";

export const metadata = {
  metadataBase: new URL(
    "https://loreshifoodhub.vercel.app"
  ),

  title: {
    default:
      "Loreshi FoodHub | Quality Nigerian Foodstuff Online",
    template:
      "%s | Loreshi FoodHub",
  },

  description:
    "Shop quality Nigerian foodstuff online from Loreshi FoodHub. Browse grains, spices, provisions and other food essentials, place your order and enjoy convenient delivery.",

  keywords: [
    "Loreshi FoodHub",
    "Nigerian foodstuff",
    "foodstuff store Nigeria",
    "buy foodstuff online Nigeria",
    "Nigerian foodstuff online",
    "foodstuff delivery Nigeria",
    "buy Nigerian food online",
    "grains Nigeria",
    "spices Nigeria",
    "food ingredients Nigeria",
  ],

  applicationName:
    "Loreshi FoodHub",

  authors: [
    {
      name: "Loreshi FoodHub",
    },
  ],

  creator:
    "Loreshi FoodHub",

  publisher:
    "Loreshi FoodHub",

  category:
    "Food & Grocery",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview":
        "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",

    locale: "en_NG",

    url: "/",

    siteName:
      "Loreshi FoodHub",

    title:
      "Loreshi FoodHub | Quality Nigerian Foodstuff Online",

    description:
      "Shop quality Nigerian foodstuff online from Loreshi FoodHub. Browse food essentials, place your order and enjoy convenient delivery.",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt:
          "Loreshi FoodHub - Quality Nigerian Foodstuff",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Loreshi FoodHub | Quality Nigerian Foodstuff Online",

    description:
      "Shop quality Nigerian foodstuff online from Loreshi FoodHub. Browse food essentials and place your order conveniently.",

    images: [
      "/og-image.jpg",
    ],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        <StructuredData />

        <FirebaseProvider>
          <AuthProvider>
            <CartProvider>
              <StorefrontHeader />

              {children}

              <StorefrontFooter />

              <WhatsAppButton />
            </CartProvider>
          </AuthProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
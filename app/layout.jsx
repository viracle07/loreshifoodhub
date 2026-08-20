import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { FirebaseProvider } from "@/lib/firebase/client-provider";
import { AuthProvider } from "@/app/context/AuthContext";

import StorefrontHeader from "@/components/layout/StorefrontHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default:
      "Loreshi FoodHub | Quality Foodstuff, Delivered",
    template: "%s | Loreshi FoodHub",
  },

  description:
    "Shop quality Nigerian foodstuff from Loreshi FoodHub and have your order delivered to you.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <FirebaseProvider>
          <AuthProvider>
            <StorefrontHeader />

            {children}
          </AuthProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
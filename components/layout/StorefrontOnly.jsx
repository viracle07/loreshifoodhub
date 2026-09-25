"use client";
import { usePathname } from "next/navigation";
export default function StorefrontOnly({ children }) {
  const path = usePathname();
  return path === "/admin-login" || path.startsWith("/dashboard/admin") ? null : children;
}

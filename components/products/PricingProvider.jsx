"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
const PricingContext = createContext(null);
export function PricingProvider({ initialPricing, children }) {
  const [pricing, setPricing] = useState(initialPricing);
  const refreshPricing = useCallback(async () => {
    const response = await fetch("/api/pricing", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to refresh prices. Please try again.");
    const next = await response.json();
    setPricing(next);
    return next;
  }, []);
  useEffect(() => {
    const refresh = () => { refreshPricing().catch(() => {}); };
    const timer = setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    window.addEventListener("pricing-changed", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pricing-changed", refresh);
    };
  }, [refreshPricing]);
  return <PricingContext.Provider value={{ ...pricing, refreshPricing }}>{children}</PricingContext.Provider>;
}
export function usePricing() { return useContext(PricingContext); }

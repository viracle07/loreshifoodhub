"use client";
import { usePricing } from "./PricingProvider";
import { sellingPrice } from "@/lib/pricing/money.mjs";
const format = (price) => new Intl.NumberFormat("en-NG", {
  style: "currency", currency: "NGN", minimumFractionDigits: 0, maximumFractionDigits: 2,
}).format(price);
export default function ProductPrice({ price, packageLabel, finalPrice }) {
  const { active } = usePricing();
  const discounted = finalPrice ?? sellingPrice(price, active);
  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      {discounted < Number(price) && <del className="text-sm font-normal text-gray-500" aria-label={`Original price ${format(price)}`}>{format(price)}</del>}
      <span className="text-lg font-bold text-[#1F1F1F]" aria-label={`Price ${format(discounted)}`}>{format(discounted)}</span>
      {packageLabel && <span className="text-xs text-gray-500">/ {packageLabel}</span>}
    </span>
  );
}

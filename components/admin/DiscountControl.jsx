"use client";
import { useEffect, useState } from "react";
export default function DiscountControl() {
  const [discount, setDiscount] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    try {
      const response = await fetch("/api/admin/discount", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDiscount(data); setError("");
    } catch (e) { setError(e.message || "Unable to load discount."); }
  }
  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);
  async function toggle() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/discount", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !discount.active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDiscount(data);
      window.dispatchEvent(new Event("pricing-changed"));
    } catch (e) { setError(e.message || "Unable to save discount."); }
    finally { setBusy(false); }
  }
  const expired = discount && Date.now() >= Date.parse(discount.endsAt);
  return (
    <section className="rounded-2xl border border-[#E7E4DC] bg-white p-5" aria-labelledby="discount-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="discount-title" className="font-bold text-[#1F1F1F]">Storewide 10% discount</h2>
          <p className="mt-1 text-sm text-gray-600">All products and pack sizes. Original prices stay saved.</p>
        </div>
        <button type="button" role="switch" aria-checked={!!discount?.active} aria-label="Storewide 10% discount"
          disabled={!discount || busy || expired} onClick={toggle}
          className={`rounded-full px-5 py-3 text-sm font-bold disabled:opacity-50 ${discount?.active ? "bg-[#68912B] text-white" : "bg-gray-100 text-gray-700"}`}>
          {busy ? "Saving…" : !discount ? "Loading…" : expired ? "Ended" : discount.active ? "On · Turn off" : "Off · Turn on"}
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">Admin only: ends after 15 October 2026, 11:59 pm (Lagos). Customers never see the end date.</p>
      <p className="mt-1 text-xs text-gray-500">Example: ₦2,150 → ₦1,935. Open customer pages refresh within 15 seconds.</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error} <button onClick={load} className="underline">Retry</button></p>}
    </section>
  );
}

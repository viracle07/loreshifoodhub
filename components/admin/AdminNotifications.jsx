"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function AdminNotifications({ adminId }) {
  const [feed, setFeed] = useState({ notifications: [], unreadCount: 0, nextCursor: null });
  const [older, setOlder] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const seen = useRef(new Set());
  const initialized = useRef(false);
  const inFlight = useRef(false);
  const key = `loreshi-admin-alerts-${adminId}`;

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const response = await fetch("/api/admin/notifications", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (initialized.current && alerts && "Notification" in window && Notification.permission === "granted") {
        const recent = data.notifications.filter((n) => !seen.current.has(n.id) && n.unread);
        if (recent.length && "serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.getRegistration("/");
          for (const n of recent) {
            await registration?.showNotification(n.title, {
              body: `${n.orderNumber} · ₦${Number(n.total).toLocaleString("en-NG")}`,
              icon: "/admin-icons/icon-192.png", tag: n.id,
              data: { url: `/dashboard/admin/orders/${encodeURIComponent(n.orderId)}` },
            });
          }
        }
      }
      data.notifications.forEach((n) => seen.current.add(n.id));
      initialized.current = true;
      setFeed(data); setError("");
    } catch (e) { setError(e.message || "Unable to load notifications."); }
    finally { setLoading(false); inFlight.current = false; }
  }, [alerts]);

  useEffect(() => {
    try { setAlerts(localStorage.getItem(key) === "true"); } catch {}
  }, [key]);
  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    window.addEventListener("focus", load);
    return () => { clearInterval(timer); window.removeEventListener("focus", load); };
  }, [load]);

  async function toggleAlerts() {
    try {
      if (!alerts) {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) throw new Error("Browser alerts are unavailable here. Your inbox still works.");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("Allow notifications in your browser settings to enable alerts.");
        await navigator.serviceWorker.register("/admin-sw.js", { scope: "/", updateViaCache: "none" });
      }
      localStorage.setItem(key, String(!alerts));
      setAlerts(!alerts); setError("");
    } catch (e) { setError(e.message); }
  }
  async function markRead() {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ throughId: feed.notifications[0]?.id }),
      });
      if (!response.ok) throw new Error("Unable to mark notifications as read.");
      setOlder([]); setCursor(null); await load();
    } catch (e) { setError(e.message); }
  }
  async function loadOlder() {
    try {
      const response = await fetch(`/api/admin/notifications?before=${encodeURIComponent(cursor || feed.nextCursor)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOlder((items) => [...items, ...data.notifications]);
      setCursor(data.nextCursor || "end");
    } catch (e) { setError(e.message); }
  }
  const notifications = [...new Map([...feed.notifications, ...older].map((n) => [n.id, n])).values()];
  return (
    <details className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
      <summary className="flex cursor-pointer items-center gap-2 font-bold text-[#1F1F1F]">
        <Bell size={19} /> Notifications
        <span aria-live="polite" className="rounded-full bg-[#EDF4E4] px-2 py-1 text-xs text-[#4C6B1C]">{feed.unreadCount} unread</span>
        {error && <span className="text-xs text-red-700">Connection issue</span>}
      </summary>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
        <button onClick={toggleAlerts} className="text-[#68912B] underline">{alerts ? "Disable browser alerts" : "Enable browser alerts"}</button>
        {!!feed.unreadCount && <button onClick={markRead} className="text-gray-600 underline">Mark all as read</button>}
        <button onClick={load} className="text-gray-600 underline">Refresh</button>
      </div>
      <p className="mt-2 text-xs text-gray-500">Updates every 15 seconds. Browser alerts work while this dashboard is open. Orders and payments remain in your inbox when you return.</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="py-4 text-sm text-gray-500">Loading notifications…</p>}
      {!loading && !notifications.length && <p className="py-4 text-sm text-gray-500">No notifications yet. New orders and confirmed payments will appear here.</p>}
      <ul className="mt-3 max-h-96 divide-y divide-gray-100 overflow-y-auto">
        {notifications.map((n) => <li key={n.id}>
          <Link href={`/dashboard/admin/orders/${encodeURIComponent(n.orderId)}`} className={`block rounded-lg p-3 hover:bg-gray-50 ${n.unread ? "bg-[#F5F8EF]" : ""}`}>
            <span className="text-sm font-bold">{n.title}</span>
            <span className="mt-1 block text-sm text-gray-600">{n.orderNumber} · ₦{Number(n.total).toLocaleString("en-NG")}</span>
            <time className="mt-1 block text-xs text-gray-500" dateTime={n.createdAt}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now"}</time>
          </Link>
        </li>)}
      </ul>
      {(cursor ? cursor !== "end" : feed.nextCursor) && <button onClick={loadOlder} className="mt-3 text-sm font-semibold text-[#68912B] underline">Load older notifications</button>}
    </details>
  );
}

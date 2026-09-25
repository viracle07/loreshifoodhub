// No customer requests or authenticated admin responses are cached.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.mode !== "navigate" ||
      !(url.pathname === "/admin-login" || url.pathname.startsWith("/dashboard/admin"))) return;
  event.respondWith(fetch(event.request).catch(() => new Response(`<!doctype html>
    <html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Loreshi Admin · Offline</title><body style="font:16px system-ui;background:#FFFDF8;color:#1f1f1f;padding:40px;max-width:480px;margin:auto">
    <h1>You’re offline</h1><p>Connect to the internet to manage products and view the latest orders.</p>
    <a href="/dashboard/admin" style="color:#4c6b1c">Try again</a></body></html>`,
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } })));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/dashboard/admin", self.location.origin);
  if (target.origin !== self.location.origin || !target.pathname.startsWith("/dashboard/admin")) return;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => new URL(client.url).pathname.startsWith("/dashboard/admin"));
    if (existing) { await existing.navigate(target.href); return existing.focus(); }
    return self.clients.openWindow(target.href);
  })());
});

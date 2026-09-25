import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import { SourceTextModule, SyntheticModule, createContext } from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { sellingPrice, priceInKobo } from "../lib/pricing/money.mjs";
import { discountIsActive, DISCOUNT_END } from "../lib/pricing/policy.mjs";
import { validWebhookSignature, matchesPayment } from "../lib/payments/validation.mjs";

test("10% applies once and rounds unit prices to kobo", () => {
  assert.equal(sellingPrice(2150, true), 1935);
  assert.equal(sellingPrice(2150, false), 2150);
  assert.equal(sellingPrice(12.35, true), 11.12);
  assert.equal(sellingPrice(0, true), 0);
  assert.equal(priceInKobo(1935, false), 193500);
  for (const invalid of [-1, NaN, Infinity, "invalid"]) assert.throws(() => sellingPrice(invalid, true));
});

test("campaign ends precisely after October 15 in Lagos and respects off switch", () => {
  const end = Date.parse(DISCOUNT_END);
  assert.equal(new Date(end).toISOString(), "2026-10-15T23:00:00.000Z");
  assert.equal(discountIsActive(true, end - 1), true);
  assert.equal(discountIsActive(true, end), false);
  assert.equal(discountIsActive(true, end + 1), false);
  assert.equal(discountIsActive(false, end - 1), false);
});

test("webhook signature rejects tampering, malformed headers and absent secrets", () => {
  const body = JSON.stringify({ event: "charge.success" });
  const signature = createHmac("sha512", "test-secret").update(body).digest("hex");
  assert.equal(validWebhookSignature(body, signature, "test-secret"), true);
  assert.equal(validWebhookSignature(body + " ", signature, "test-secret"), false);
  for (const invalid of [null, "", "abc", "z".repeat(128)]) {
    assert.equal(validWebhookSignature(body, invalid, "test-secret"), false);
  }
  assert.equal(validWebhookSignature(body, signature, ""), false);
});

test("payment amount, currency, success status and reference must all match", () => {
  const valid = { amount: 193500, currency: "NGN", status: "success", reference: "test-ref" };
  assert.equal(matchesPayment(valid, "test-ref", 1935), true);
  for (const patch of [{ amount: 215000 }, { currency: "USD" }, { status: "pending" }, { reference: "other" }]) {
    assert.equal(matchesPayment({ ...valid, ...patch }, "test-ref", 1935), false);
  }
  assert.equal(matchesPayment(valid, "test-ref", NaN), false);
});

// Load real server modules with only the external database/auth/framework edges replaced.
// No Firebase credentials, network calls or real orders are used by this suite.
async function fixture({ enabled = true, user = { uid: "customer-1" }, admin = { uid: "admin-1" }, now = "2026-09-24T10:00:00Z" } = {}) {
  const store = new Map([
    ["settings/storeDiscount", { enabled }],
    ["products/rice", { name: "Rice", active: true, stockStatus: "in_stock", variants: [
      { id: "small", price: 2150, active: true }, { id: "large", price: 4000, active: true },
    ] }],
  ]);
  let counter = 0;
  let queue = Promise.resolve();
  class Timestamp {
    constructor(ms) { this.ms = ms; }
    static fromMillis(ms) { return new Timestamp(ms); }
    toMillis() { return this.ms; }
    toDate() { return new Date(this.ms); }
  }
  const ref = (key) => ({
    id: key.split("/").at(-1), key,
    get: async () => ({ exists: store.has(key), id: key.split("/").at(-1), ref: ref(key), data: () => store.get(key) }),
    set: async (data, options) => store.set(key, options?.merge ? { ...store.get(key), ...data } : data),
  });
  const commit = (writes) => {
    for (const [kind, target] of writes) {
      if (kind === "create" && store.has(target.key)) throw new Error("already-exists");
      if (kind === "update" && !store.has(target.key)) throw new Error("not-found");
    }
    for (const [kind, target, data] of writes) store.set(target.key,
      kind === "update" ? { ...store.get(target.key), ...data } : data);
  };
  const writer = () => {
    const writes = [];
    return {
      get: (target) => target.get(),
      set: (target, data) => writes.push(["set", target, data]),
      create: (target, data) => writes.push(["create", target, data]),
      update: (target, data) => writes.push(["update", target, data]),
      commit: async () => commit(writes),
    };
  };
  function collection(name, settings = {}) {
    const { filters = [], sort = null, maximum = Infinity, after = null } = settings;
    const query = {
      doc: (id = `generated${++counter}`) => ref(`${name}/${id}`),
      where: (field, operator, value) => collection(name, { ...settings, filters: [...filters, [field, operator, value]] }),
      orderBy: (field, direction) => collection(name, { ...settings, sort: [field, direction] }),
      limit: (limit) => collection(name, { ...settings, maximum: limit }),
      startAfter: (snapshot) => collection(name, { ...settings, after: snapshot.id }),
      get: async () => {
        const comparable = (value) => value?.toMillis ? value.toMillis() : value;
        let entries = [...store].filter(([key]) => key.split("/")[0] === name);
        entries = entries.filter(([, data]) => filters.every(([field, op, value]) =>
          op === ">" ? comparable(data[field]) > comparable(value) : comparable(data[field]) === comparable(value)));
        if (sort) entries.sort((a, b) => (comparable(a[1][sort[0]]) - comparable(b[1][sort[0]])) * (sort[1] === "desc" ? -1 : 1));
        if (after) entries = entries.slice(entries.findIndex(([key]) => key.split("/").at(-1) === after) + 1);
        const docs = await Promise.all(entries.slice(0, maximum).map(([key]) => ref(key).get()));
        return { docs, size: docs.length, empty: docs.length === 0 };
      },
      count: () => ({ get: async () => { const result = await query.get(); return { data: () => ({ count: result.size }) }; } }),
    };
    return query;
  }
  const db = {
    collection,
    batch: writer,
    runTransaction: (callback) => {
      const result = queue.then(async () => {
        const tx = writer(); const result = await callback(tx); await tx.commit(); return result;
      });
      queue = result.catch(() => {});
      return result;
    },
  };
  const fieldValue = { serverTimestamp: () => Timestamp.fromMillis(Date.parse(now)) };
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return Date.parse(now); }
  }
  const context = createContext({ Response, Request, URL, Buffer, console, Date: Clock, process: { env: {} } });
  const stubs = {
    "server-only": {},
    "next/server": { NextResponse: { json: (body, options) => Response.json(body, options) } },
    "firebase-admin/firestore": { FieldValue: fieldValue, Timestamp },
    "@/lib/firebase/admin": { adminDb: db },
    "@/lib/auth/session": { getCurrentUser: async () => user },
    "@/lib/auth/admin-auth": { getCurrentAdmin: async () => admin },
    "node:crypto": await import("node:crypto"),
  };
  const cache = new Map();
  const project = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
  async function moduleFor(specifier, parent = path.join(project, "index.js")) {
    let key = specifier;
    if (!(specifier in stubs)) {
      key = specifier.startsWith("@/") ? path.join(project, specifier.slice(2)) : path.resolve(path.dirname(parent), specifier);
      if (!path.extname(key)) key += ".js";
    }
    if (cache.has(key)) return cache.get(key);
    let module;
    if (specifier in stubs) {
      const values = stubs[specifier];
      module = new SyntheticModule(Object.keys(values), function () {
        Object.entries(values).forEach(([name, value]) => this.setExport(name, value));
      }, { context, identifier: key });
    } else {
      module = new SourceTextModule(await readFile(key, "utf8"), { context, identifier: key });
    }
    cache.set(key, module);
    return module;
  }
  async function load(relative) {
    const module = await moduleFor(`@/${relative}`);
    await module.link((specifier, parent) => moduleFor(specifier, parent.identifier));
    await module.evaluate();
    return module.namespace;
  }
  return { store, db, load, Timestamp };
}

const orderBody = (expectedTotal = 7470) => ({
  customer: { name: "Test Buyer", phone: "08000000000", email: "buyer@example.test" },
  delivery: { address: "Test address", city: "Lagos", state: "Lagos" },
  paymentMethod: "online", expectedTotal,
  items: [{ productId: "rice", variantId: "small", quantity: 2 }, { productId: "rice", variantId: "large", quantity: 1 }],
});
const request = (body) => new Request("https://example.test/api/orders", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

test("order creation charges every variant at 10% off and records one notification atomically", async () => {
  const f = await fixture();
  const { POST } = await f.load("app/api/orders/route.js");
  const response = await POST(request(orderBody()));
  assert.equal(response.status, 201);
  const { order } = await response.json();
  assert.equal(order.total, 7470);
  const stored = f.store.get(`orders/${order.id}`);
  assert.equal(stored.items[0].price, 1935);
  assert.equal(stored.items[0].originalPrice, 2150);
  assert.equal(stored.items[1].price, 3600);
  assert.equal(f.store.get("products/rice").variants[0].price, 2150);
  assert.equal(f.store.get(`adminNotifications/order_${order.id}`).type, "order");
});

test("disabled campaign uses original prices and stale checkout cannot create an order", async () => {
  const f = await fixture({ enabled: false });
  const { POST } = await f.load("app/api/orders/route.js");
  assert.equal((await POST(request(orderBody()))).status, 409);
  assert.equal([...f.store.keys()].some((key) => key.startsWith("orders/")), false);
  const response = await POST(request(orderBody(8300)));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).order.total, 8300);
});

test("client-supplied prices are ignored and unavailable variants cannot be ordered", async () => {
  const f = await fixture();
  const { POST } = await f.load("app/api/orders/route.js");
  const body = orderBody(1);
  body.items[0].price = 0;
  assert.equal((await POST(request(body))).status, 409);
  f.store.get("products/rice").variants[0].active = false;
  assert.equal((await POST(request(orderBody()))).status, 400);
  assert.equal([...f.store.keys()].some((key) => key.startsWith("adminNotifications/")), false);
});

test("order creation requires a customer session", async () => {
  const f = await fixture({ user: null });
  const { POST } = await f.load("app/api/orders/route.js");
  assert.equal((await POST(request(orderBody()))).status, 401);
});

test("quantity totals round each discounted unit before multiplying", async () => {
  const f = await fixture();
  f.store.get("products/rice").variants[0].price = 12.35;
  const { POST } = await f.load("app/api/orders/route.js");
  const body = orderBody(33.36);
  body.items = [{ productId: "rice", variantId: "small", quantity: 3 }];
  const response = await POST(request(body));
  assert.equal(response.status, 201);
  const { order } = await response.json();
  assert.equal(order.total, 33.36);
  assert.equal(f.store.get(`orders/${order.id}`).items[0].lineTotal, 33.36);
});

test("duplicate callback/webhook confirmations produce one alert and preserve fulfillment progress", async () => {
  const f = await fixture();
  f.store.set("orders/order1", { total: 1935, orderNumber: "TEST1", paymentReference: "ref1", paymentStatus: "unpaid", status: "pending" });
  const { confirmPayment } = await f.load("lib/payments/confirmation.js");
  const ref = f.db.collection("orders").doc("order1");
  const payment = { reference: "ref1", amount: 193500, status: "success", currency: "NGN", id: 1 };
  await Promise.all([confirmPayment(ref, payment, "ref1"), confirmPayment(ref, payment, "ref1")]);
  assert.equal(f.store.get("orders/order1").paymentStatus, "paid");
  assert.equal(f.store.get("orders/order1").status, "confirmed");
  f.store.get("orders/order1").status = "completed";
  await confirmPayment(ref, payment, "ref1");
  assert.equal(f.store.get("orders/order1").status, "completed");
  assert.equal([...f.store.keys()].filter((key) => key.startsWith("adminNotifications/")).length, 1);
});

test("mismatched payment cannot mark an order paid or create an alert", async () => {
  const f = await fixture();
  f.store.set("orders/order1", { total: 1935, paymentReference: "ref1", paymentStatus: "unpaid", status: "pending" });
  const { confirmPayment } = await f.load("lib/payments/confirmation.js");
  await assert.rejects(confirmPayment(f.db.collection("orders").doc("order1"), {
    reference: "ref1", amount: 100, status: "success", currency: "NGN",
  }, "ref1"));
  assert.equal(f.store.get("orders/order1").paymentStatus, "unpaid");
  assert.equal(f.store.has("adminNotifications/payment_order1"), false);
});

test("delayed payment from an earlier retained attempt still confirms the correct order", async () => {
  const f = await fixture();
  f.store.set("orders/order1", { total: 1935, paymentReference: "new-ref", paymentStatus: "processing", status: "pending" });
  f.store.set("paymentAttempts/old-ref", { orderId: "order1", total: 1935 });
  const { confirmPayment } = await f.load("lib/payments/confirmation.js");
  await confirmPayment(f.db.collection("orders").doc("order1"), {
    reference: "old-ref", amount: 193500, status: "success", currency: "NGN",
  }, "old-ref");
  assert.equal(f.store.get("orders/order1").paymentStatus, "paid");
  assert.equal(f.store.has("adminNotifications/payment_order1"), true);
});

test("public pricing exposes no campaign end date", async () => {
  const f = await fixture();
  const { GET } = await f.load("app/api/pricing/route.js");
  const response = await GET();
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), { active: true, percentage: 10 });
});

test("admin discount switch persists off without changing product prices", async () => {
  const f = await fixture();
  const { PATCH, GET } = await f.load("app/api/admin/discount/route.js");
  const response = await PATCH(request({ enabled: false }));
  assert.equal(response.status, 200);
  assert.equal(f.store.get("settings/storeDiscount").enabled, false);
  assert.equal((await (await GET()).json()).active, false);
  assert.equal(f.store.get("products/rice").variants[0].price, 2150);
});

test("non-admin users cannot view or modify campaign controls", async () => {
  const f = await fixture({ admin: null });
  const { PATCH, GET } = await f.load("app/api/admin/discount/route.js");
  assert.equal((await GET()).status, 403);
  assert.equal((await PATCH(request({ enabled: false }))).status, 403);
  assert.equal(f.store.get("settings/storeDiscount").enabled, true);
});

test("campaign cannot be re-enabled after expiry", async () => {
  const f = await fixture({ now: "2026-10-16T00:00:00+01:00" });
  const { PATCH, GET } = await f.load("app/api/admin/discount/route.js");
  assert.equal((await (await GET()).json()).active, false);
  assert.equal((await PATCH(request({ enabled: true }))).status, 400);
});

test("expired checkout charges original amounts even if enabled flag remains true", async () => {
  const f = await fixture({ now: "2026-10-16T00:00:00+01:00" });
  const { POST } = await f.load("app/api/orders/route.js");
  assert.equal((await POST(request(orderBody()))).status, 409);
  const response = await POST(request(orderBody(8300)));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).order.total, 8300);
});

test("notification inbox and read actions reject unauthenticated users", async () => {
  const f = await fixture({ admin: null });
  const { GET, PATCH } = await f.load("app/api/admin/notifications/route.js");
  assert.equal((await GET(new Request("https://example.test/api/admin/notifications"))).status, 403);
  assert.equal((await PATCH(request({ throughId: "order_one" }))).status, 403);
});

test("notification read action preserves events arriving after the displayed inbox", async () => {
  const f = await fixture();
  const event = (id, time) => ({ type: "order", title: "New order placed", orderId: id,
    orderNumber: id, total: 1935, createdAt: f.Timestamp.fromMillis(time) });
  f.store.set("adminNotifications/order_one", event("one", 1000));
  const { GET, PATCH } = await f.load("app/api/admin/notifications/route.js");
  const inboxRequest = new Request("https://example.test/api/admin/notifications");
  const initial = await (await GET(inboxRequest)).json();
  assert.equal(initial.unreadCount, 1);
  f.store.set("adminNotifications/order_two", event("two", 2000));
  assert.equal((await PATCH(request({ throughId: initial.notifications[0].id }))).status, 200);
  const next = await (await GET(inboxRequest)).json();
  assert.equal(next.unreadCount, 1);
  assert.equal(next.notifications[0].id, "order_two");
  assert.equal(next.notifications[0].unread, true);
  assert.equal(next.notifications[1].unread, false);
  assert.equal(f.store.has("adminNotificationState/admin-1"), true);
  assert.equal(f.store.has("adminNotificationState/customer-1"), false);
});

test("notification history paginates without losing events", async () => {
  const f = await fixture();
  for (let i = 0; i < 35; i++) f.store.set(`adminNotifications/order_n${i}`, {
    type: "order", title: "New order placed", orderId: `n${i}`, orderNumber: `n${i}`, total: 10,
    createdAt: f.Timestamp.fromMillis(1000 + i),
  });
  const { GET } = await f.load("app/api/admin/notifications/route.js");
  const first = await (await GET(new Request("https://example.test/api/admin/notifications"))).json();
  assert.equal(first.notifications.length, 30);
  assert.equal(first.unreadCount, 35);
  const second = await (await GET(new Request(`https://example.test/api/admin/notifications?before=${first.nextCursor}`))).json();
  assert.equal(second.notifications.length, 5);
  assert.equal(second.nextCursor, null);
  assert.equal(new Set([...first.notifications, ...second.notifications].map((n) => n.id)).size, 35);
});

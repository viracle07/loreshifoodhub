import { getCurrentAdmin } from "@/lib/auth/admin-auth";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const epoch = Timestamp.fromMillis(0);
export async function GET(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ error: "Admin authentication required." }, { status: 403 });
  try {
    const state = await adminDb.collection("adminNotificationState").doc(admin.uid).get();
    const readThrough = state.data()?.readThrough || epoch;
    const events = adminDb.collection("adminNotifications");
    let query = events.orderBy("createdAt", "desc").limit(30);
    const before = new URL(request.url).searchParams.get("before");
    if (before) {
      if (!/^(order|payment)_[a-zA-Z0-9]+$/.test(before)) return Response.json({ error: "Invalid cursor." }, { status: 400 });
      const cursor = await events.doc(before).get();
      if (!cursor.exists) return Response.json({ error: "Notification not found." }, { status: 404 });
      query = query.startAfter(cursor);
    }
    const [snapshot, count] = await Promise.all([
      query.get(), events.where("createdAt", ">", readThrough).count().get(),
    ]);
    const notifications = snapshot.docs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, type: data.type, title: data.title, orderId: data.orderId,
        orderNumber: data.orderNumber, total: data.total,
        createdAt: data.createdAt?.toDate().toISOString() || null,
        unread: data.createdAt ? data.createdAt.toMillis() > readThrough.toMillis() : true };
    });
    return Response.json({ notifications, unreadCount: count.data().count,
      nextCursor: snapshot.size === 30 ? snapshot.docs.at(-1).id : null },
      { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Notification inbox error:", error.message);
    return Response.json({ error: "Unable to load notifications. Retrying shortly." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ error: "Admin authentication required." }, { status: 403 });
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const { throughId } = await request.json();
    if (typeof throughId !== "string" || !/^(order|payment)_[a-zA-Z0-9]+$/.test(throughId)) {
      return Response.json({ error: "Invalid notification." }, { status: 400 });
    }
    const event = await adminDb.collection("adminNotifications").doc(throughId).get();
    if (!event.exists) return Response.json({ error: "Notification not found." }, { status: 404 });
    const stateRef = adminDb.collection("adminNotificationState").doc(admin.uid);
    await adminDb.runTransaction(async (tx) => {
      const state = await tx.get(stateRef);
      const current = state.data()?.readThrough || epoch;
      const next = event.data().createdAt;
      if (next && next.toMillis() > current.toMillis()) tx.set(stateRef, { readThrough: next });
    });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Unable to mark notifications as read." }, { status: 500 });
  }
}

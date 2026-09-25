import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { notificationData } from "@/lib/notifications/events";
import { matchesPayment } from "./validation.mjs";

// The transaction prevents duplicate alerts and status regression on callback/webhook retries.
export async function confirmPayment(orderRef, payment, reference) {
  return adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(orderRef);
    if (!snapshot.exists) throw new Error("Payment order not found.");
    const order = snapshot.data();
    const attempt = await tx.get(adminDb.collection("paymentAttempts").doc(reference));
    const knownReference = attempt.exists
      ? attempt.data().orderId === orderRef.id && Number(attempt.data().total) === Number(order.total)
      : order.paymentReference === reference;
    if (!knownReference || !matchesPayment(payment, reference, order.total)) {
      throw new Error("Payment details do not match the order.");
    }
    if (order.paymentStatus === "paid") return order;
    const status = order.status === "pending" ? "confirmed" : order.status;
    tx.update(orderRef, {
      paymentStatus: "paid", paymentMethod: "online", status,
      paymentTransactionId: payment.id ? String(payment.id) : null,
      paymentChannel: payment.channel || null,
      paidAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    tx.create(adminDb.collection("adminNotifications").doc(`payment_${orderRef.id}`),
      notificationData("payment", orderRef.id, order));
    return { ...order, paymentStatus: "paid", status };
  });
}

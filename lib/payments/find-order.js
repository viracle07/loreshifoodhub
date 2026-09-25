import "server-only";
import { adminDb } from "@/lib/firebase/admin";
export async function findPaymentOrder(reference) {
  if (!/^[a-zA-Z0-9._=-]{1,200}$/.test(reference)) return null;
  const attempt = await adminDb.collection("paymentAttempts").doc(reference).get();
  if (attempt.exists) {
    const order = await adminDb.collection("orders").doc(attempt.data().orderId).get();
    return order.exists ? order : null;
  }
  // Legacy orders created before payment attempts were retained.
  const snapshot = await adminDb.collection("orders").where("paymentReference", "==", reference).limit(1).get();
  return snapshot.docs[0] || null;
}

import "server-only";
import { FieldValue } from "firebase-admin/firestore";
export function notificationData(type, orderId, order) {
  return {
    type, orderId, orderNumber: order.orderNumber || orderId,
    total: Number(order.total),
    title: type === "payment" ? "Payment received" : "New order placed",
    createdAt: FieldValue.serverTimestamp(),
  };
}

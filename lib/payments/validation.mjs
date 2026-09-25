import { createHmac, timingSafeEqual } from "node:crypto";
export function validWebhookSignature(body, signature, secret) {
  if (!secret || typeof signature !== "string" || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", secret).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export function matchesPayment(transaction, reference, total) {
  const amount = Number(total);
  return Number.isFinite(amount) && amount > 0 &&
    transaction?.status === "success" && transaction.reference === reference &&
    transaction.currency === "NGN" && Number(transaction.amount) === Math.round(amount * 100);
}

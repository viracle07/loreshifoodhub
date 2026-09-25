import { findPaymentOrder } from "@/lib/payments/find-order";
import { validWebhookSignature } from "@/lib/payments/validation.mjs";
import { confirmPayment } from "@/lib/payments/confirmation";

export const runtime = "nodejs";
export async function POST(request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return Response.json({ error: "Payment service unavailable." }, { status: 503 });
  const body = await request.text();
  if (!validWebhookSignature(body, request.headers.get("x-paystack-signature"), secret)) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }
  let event;
  try { event = JSON.parse(body); }
  catch { return Response.json({ error: "Invalid payload." }, { status: 400 }); }
  if (event.event !== "charge.success") return Response.json({ received: true });
  const reference = event.data?.reference;
  if (typeof reference !== "string" || !reference) return Response.json({ error: "Missing reference." }, { status: 400 });
  try {
    const order = await findPaymentOrder(reference);
    // Unknown payments may belong to another application using the same Paystack account.
    if (!order) return Response.json({ received: true });
    await confirmPayment(order.ref, event.data, reference);
    return Response.json({ received: true });
  } catch (error) {
    console.error("Payment webhook could not be recorded:", error.message);
    // A non-200 response asks Paystack to retry transient database failures.
    return Response.json({ error: "Unable to record payment." }, { status: 500 });
  }
}

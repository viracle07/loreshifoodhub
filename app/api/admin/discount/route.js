import { getCurrentAdmin } from "@/lib/auth/admin-auth";
import { adminDb } from "@/lib/firebase/admin";
import { getDiscount } from "@/lib/pricing/service";
import { discountIsActive } from "@/lib/pricing/policy.mjs";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  if (!await getCurrentAdmin()) return Response.json({ error: "Admin authentication required." }, { status: 403 });
  try {
    return Response.json(await getDiscount(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Unable to load discount settings." }, { status: 500 });
  }
}
export async function PATCH(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ error: "Admin authentication required." }, { status: 403 });
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const { enabled } = await request.json();
    if (typeof enabled !== "boolean") return Response.json({ error: "Choose on or off." }, { status: 400 });
    if (enabled && !discountIsActive(true)) return Response.json({ error: "This campaign has ended." }, { status: 400 });
    await adminDb.collection("settings").doc("storeDiscount").set({ enabled, updatedBy: admin.uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return Response.json(await getDiscount());
  } catch {
    return Response.json({ error: "Unable to save discount settings." }, { status: 500 });
  }
}

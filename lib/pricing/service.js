import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { DISCOUNT_END, discountIsActive } from "./policy.mjs";

export async function getDiscount() {
  const snapshot = await adminDb.collection("settings").doc("storeDiscount").get();
  // Starts enabled on deployment; the admin switch persists its state.
  const enabled = snapshot.exists ? snapshot.data().enabled === true : true;
  return { enabled, active: discountIsActive(enabled), percentage: 10, endsAt: DISCOUNT_END };
}
export async function getPublicPricing() {
  const { active, percentage } = await getDiscount();
  return { active, percentage };
}

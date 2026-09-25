// Server policy: never import this module into a client component.
export const DISCOUNT_END = "2026-10-16T00:00:00+01:00";
export function discountIsActive(enabled, now = Date.now()) {
  return enabled === true && Number(now) < Date.parse(DISCOUNT_END);
}

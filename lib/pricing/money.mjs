export function priceInKobo(price, active = false) {
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid product price");
  const kobo = Math.round(amount * 100);
  return active ? Math.round(kobo * 90 / 100) : kobo;
}
export function sellingPrice(price, active = false) {
  return priceInKobo(price, active) / 100;
}

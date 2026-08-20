export const PRODUCT_STOCK_STATUS = {
  IN_STOCK: "in_stock",
  OUT_OF_STOCK: "out_of_stock",
  LOW_STOCK: "low_stock",
  DISCONTINUED: "discontinued",
};

export const PACKAGE_UNITS = [
  "g",
  "kg",
  "ml",
  "litre",
  "piece",
  "pack",
  "bottle",
  "carton",
  "bag",
  "full_pack",
  "custom",
];

export function createProductSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatProductPrice(price) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPackageLabel(variant) {
  if (!variant) {
    return "";
  }

  if (variant.label) {
    return variant.label;
  }

  if (
    variant.packageSize !== null &&
    variant.packageSize !== undefined &&
    variant.packageUnit
  ) {
    return `${variant.packageSize} ${variant.packageUnit}`;
  }

  return "Sealed pack";
}
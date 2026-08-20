import {
  PACKAGE_UNITS,
  PRODUCT_STOCK_STATUS,
} from "./product-utils";

export function validateProductInput(data) {
  const errors = {};

  if (!data?.name?.trim()) {
    errors.name = "Product name is required.";
  }

  if (!data?.description?.trim()) {
    errors.description = "Product description is required.";
  }

  if (!data?.categoryId?.trim()) {
    errors.categoryId = "Product category is required.";
  }

  if (!Array.isArray(data?.variants) || data.variants.length === 0) {
    errors.variants = "At least one product variant is required.";
  }

  if (Array.isArray(data?.variants)) {
    data.variants.forEach((variant, index) => {
      if (!variant?.label?.trim()) {
        errors[`variant_${index}_label`] =
          "Variant label is required.";
      }

      if (
        typeof variant?.price !== "number" ||
        !Number.isFinite(variant.price) ||
        variant.price < 0
      ) {
        errors[`variant_${index}_price`] =
          "Variant price must be a valid non-negative number.";
      }

      if (
        variant?.packageUnit &&
        !PACKAGE_UNITS.includes(variant.packageUnit)
      ) {
        errors[`variant_${index}_packageUnit`] =
          "Invalid package unit.";
      }

      if (
        variant?.packageSize !== null &&
        variant?.packageSize !== undefined
      ) {
        if (
          typeof variant.packageSize !== "number" ||
          !Number.isFinite(variant.packageSize) ||
          variant.packageSize <= 0
        ) {
          errors[`variant_${index}_packageSize`] =
            "Package size must be greater than zero.";
        }
      }
    });
  }

  if (
    data?.stockStatus &&
    !Object.values(PRODUCT_STOCK_STATUS).includes(
      data.stockStatus
    )
  ) {
    errors.stockStatus = "Invalid stock status.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
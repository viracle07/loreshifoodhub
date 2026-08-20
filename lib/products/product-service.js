import "server-only";

import { adminDb } from "@/lib/firebase/admin";

function serializeFirestoreValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeFirestoreValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, nestedValue]) => [
          key,
          serializeFirestoreValue(nestedValue),
        ]
      )
    );
  }

  return value;
}

function mapProductDocument(doc) {
  const data = doc.data();

  return serializeFirestoreValue({
    id: doc.id,
    ...data,
  });
}

export async function getPublishedProducts({
  categoryId = null,
  newOnly = false,
  hotOnly = false,
  featuredOnly = false,
} = {}) {
  let query = adminDb
    .collection("products")
    .where("active", "==", true);

  if (categoryId) {
    query = query.where(
      "categoryId",
      "==",
      categoryId
    );
  }

  if (newOnly) {
    query = query.where(
      "isNew",
      "==",
      true
    );
  }

  if (hotOnly) {
    query = query.where(
      "isHot",
      "==",
      true
    );
  }

  if (featuredOnly) {
    query = query.where(
      "featured",
      "==",
      true
    );
  }

  const snapshot = await query
    .orderBy("sortOrder", "asc")
    .get();

  return snapshot.docs.map(mapProductDocument);
}

export async function getNewProducts(limit = 8) {
  const snapshot = await adminDb
    .collection("products")
    .where("active", "==", true)
    .where("isNew", "==", true)
    .orderBy("sortOrder", "asc")
    .limit(limit)
    .get();

  return snapshot.docs.map(mapProductDocument);
}

export async function getHotProducts(limit = 8) {
  const snapshot = await adminDb
    .collection("products")
    .where("active", "==", true)
    .where("isHot", "==", true)
    .orderBy("sortOrder", "asc")
    .limit(limit)
    .get();

  return snapshot.docs.map(mapProductDocument);
}

export async function getFeaturedProducts(limit = 8) {
  const snapshot = await adminDb
    .collection("products")
    .where("active", "==", true)
    .where("featured", "==", true)
    .orderBy("sortOrder", "asc")
    .limit(limit)
    .get();

  return snapshot.docs.map(mapProductDocument);
}

export async function getProductBySlug(slug) {
  const snapshot = await adminDb
    .collection("products")
    .where("slug", "==", slug)
    .where("active", "==", true)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return mapProductDocument(snapshot.docs[0]);
}

export async function getRelatedProducts(
  categoryId,
  excludeProductId,
  limit = 4
) {
  if (!categoryId) {
    return [];
  }

  const snapshot = await adminDb
    .collection("products")
    .where("active", "==", true)
    .where("categoryId", "==", categoryId)
    .orderBy("sortOrder", "asc")
    .limit(limit + 1)
    .get();

  return snapshot.docs
    .map(mapProductDocument)
    .filter(
      (product) =>
        product.id !== excludeProductId &&
        product.stockStatus !==
          "discontinued"
    )
    .slice(0, limit);
}
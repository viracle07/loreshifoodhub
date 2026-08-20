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

function mapCategoryDocument(doc) {
  return serializeFirestoreValue({
    id: doc.id,
    ...doc.data(),
  });
}

export async function getActiveCategories() {
  const snapshot = await adminDb
    .collection("categories")
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .get();

  return snapshot.docs.map(mapCategoryDocument);
}

export async function getCategoryById(categoryId) {
  if (!categoryId) {
    return null;
  }

  const doc = await adminDb
    .collection("categories")
    .doc(categoryId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return mapCategoryDocument(doc);
}
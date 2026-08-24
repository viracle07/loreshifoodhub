"use client";

import { useEffect, useState } from "react";

import AddCategoryModal from "@/components/admin/categories/AddCategoryModal";
import {
  Plus,
  Pencil,
  Loader2,
  FolderTree,
} from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [addModalOpen, setAddModalOpen] =
    useState(false);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/categories",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Unable to load categories."
        );
      }

      setCategories(
        Array.isArray(data.categories)
          ? data.categories
          : []
      );
    } catch (err) {
      console.error(
        "Load categories error:",
        err
      );

      setError(
        err.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF4E4] text-[#68912B]">
                <FolderTree size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
                  Categories
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage the food categories
                  used across Loreshi
                  FoodHub.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setAddModalOpen(true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8F1D1D] focus:outline-none focus:ring-2 focus:ring-[#B22625] focus:ring-offset-2"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* ERROR */}
        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* CONTENT */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#E7E4DC] bg-white shadow-sm">

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Loading categories...
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF4E4] text-[#68912B]">
                <FolderTree size={26} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#1F1F1F]">
                No categories yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                Create your first food category
                to start organizing the Loreshi
                product catalogue.
              </p>

              <button
                type="button"
                onClick={() =>
                  setAddModalOpen(true)
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#B22625] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8F1D1D]"
              >
                <Plus size={18} />
                Create First Category
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="border-b border-[#E7E4DC] bg-[#FAF9F5]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Slug
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Order
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E7E4DC]">
                    {categories.map(
                      (category) => (
                        <tr
                          key={category.id}
                          className="transition hover:bg-[#FFFDF8]"
                        >
                          {/* CATEGORY */}
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#1F1F1F]">
                              {category.name}
                            </p>
                          </td>

                          {/* SLUG */}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {category.slug}
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                category.active
                                  ? "bg-[#EDF4E4] text-[#68912B]"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {category.active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          {/* ORDER */}
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {category.sortOrder ??
                              0}
                          </td>

                          {/* ACTION */}
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm font-medium text-[#1F1F1F] transition hover:bg-[#EDF4E4]"
                            >
                              <Pencil
                                size={16}
                              />
                              Edit
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="divide-y divide-[#E7E4DC] md:hidden">
                {categories.map(
                  (category) => (
                    <div
                      key={category.id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#1F1F1F]">
                            {category.name}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            {category.slug}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            category.active
                              ? "bg-[#EDF4E4] text-[#68912B]"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {category.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Order:{" "}
                          {category.sortOrder ??
                            0}
                        </span>

                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm font-medium text-[#1F1F1F]"
                        >
                          <Pencil
                            size={16}
                          />
                          Edit
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ADD CATEGORY MODAL */}
      <AddCategoryModal
        open={addModalOpen}
        onClose={() =>
          setAddModalOpen(false)
        }
        onCreated={() => {
          setAddModalOpen(false);
          fetchCategories();
        }}
      />
    </main>
  );
}
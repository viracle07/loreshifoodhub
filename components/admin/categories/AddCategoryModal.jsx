"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  Plus,
} from "lucide-react";

export default function AddCategoryModal({
  open,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    sortOrder: 0,
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!open) {
    return null;
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const name =
      form.name.trim();

    if (!name) {
      setError(
        "Category name is required."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/categories",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id:
                form.id.trim() ||
                undefined,

              name,

              sortOrder:
                Number(
                  form.sortOrder
                ) || 0,
            }),
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
            "Unable to create category."
        );
      }

      setForm({
        id: "",
        name: "",
        sortOrder: 0,
      });

      onCreated?.(
        data.category
      );

      onClose?.();
    } catch (err) {
      console.error(
        "Create category error:",
        err
      );

      setError(
        err.message ||
          "Unable to create category."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(
    event
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      if (!loading) {
        onClose?.();
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-6 backdrop-blur-sm"
      onMouseDown={
        handleBackdropClick
      }
    >
      <div
        className="mx-auto my-4 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl sm:my-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-category-title"
      >

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#E7E4DC] px-5 py-4 sm:px-6">
          <div>
            <h2
              id="add-category-title"
              className="text-lg font-bold text-[#1F1F1F]"
            >
              Add Category
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Create a category for
              organizing your products.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onClose?.()
            }
            disabled={loading}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-[#F5F3EC] hover:text-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >

          {/* CATEGORY ID */}
          <div>
            <label
              htmlFor="category-id"
              className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
            >
              Category ID

              <span className="ml-1 font-normal text-gray-400">
                optional
              </span>
            </label>

            <input
              id="category-id"
              name="id"
              type="text"
              value={form.id}
              onChange={
                handleChange
              }
              placeholder="e.g. grains"
              disabled={loading}
              className="w-full rounded-xl border border-[#E7E4DC] bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] disabled:bg-gray-50"
            />

            <p className="mt-1.5 text-xs leading-5 text-gray-400">
              Use a simple ID such as
              "grains" or
              "fish-seafood". Leave
              empty for automatic ID.
            </p>
          </div>

          {/* CATEGORY NAME */}
          <div>
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
            >
              Category Name

              <span className="ml-1 text-[#B22625]">
                *
              </span>
            </label>

            <input
              id="category-name"
              name="name"
              type="text"
              value={form.name}
              onChange={
                handleChange
              }
              placeholder="e.g. Grains"
              required
              disabled={loading}
              className="w-full rounded-xl border border-[#E7E4DC] bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] disabled:bg-gray-50"
            />

            <p className="mt-1.5 text-xs text-gray-400">
              This is the name customers
              will see when browsing
              products.
            </p>
          </div>

          {/* DISPLAY ORDER */}
          <div>
            <label
              htmlFor="category-sort-order"
              className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
            >
              Display Order
            </label>

            <input
              id="category-sort-order"
              name="sortOrder"
              type="number"
              min="0"
              value={
                form.sortOrder
              }
              onChange={
                handleChange
              }
              disabled={loading}
              className="w-full rounded-xl border border-[#E7E4DC] bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] disabled:bg-gray-50"
            />

            <p className="mt-1.5 text-xs text-gray-400">
              Lower numbers appear
              first.
            </p>
          </div>

          {/* ERROR */}
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          ) : null}

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#E7E4DC] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                onClose?.()
              }
              disabled={loading}
              className="rounded-xl border border-[#E7E4DC] bg-white px-5 py-3 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F5F3EC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B22625] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8F1D1D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
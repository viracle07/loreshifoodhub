"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

const EMPTY_VARIANT = {
  label: "",
  price: "",
  packageSize: "",
  packageUnit: "",
  active: true,
};

const STOCK_OPTIONS = [
  {
    value: "in_stock",
    label: "In Stock",
  },
  {
    value: "out_of_stock",
    label: "Out of Stock",
  },
  {
    value: "discontinued",
    label: "Discontinued",
  },
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params?.id;

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deactivating, setDeactivating] =
    useState(false);

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [error, setError] =
    useState("");

  const [uploadError, setUploadError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    categoryName: "",
    images: [],
    variants: [
      {
        ...EMPTY_VARIANT,
      },
    ],
    active: true,
    stockStatus: "in_stock",
    isNew: false,
    isHot: false,
    featured: false,
    sortOrder: 0,
  });

  /*
   * LOAD PRODUCT
   */
  useEffect(() => {
    if (!productId) {
      return;
    }

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/products/${productId}`,
          {
            method: "GET",
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
              "Unable to load product."
          );
        }

        const product =
          data.product;

        setForm({
          name:
            product.name || "",

          description:
            product.description || "",

          categoryId:
            product.categoryId || "",

          categoryName:
            product.categoryName || "",

          images:
            Array.isArray(
              product.images
            )
              ? product.images
              : [],

          variants:
            Array.isArray(
              product.variants
            ) &&
            product.variants.length
              ? product.variants.map(
                  (variant) => ({
                    id:
                      variant.id ||
                      "",

                    label:
                      variant.label ||
                      "",

                    price:
                      variant.price ??
                      "",

                    packageSize:
                      variant.packageSize ??
                      "",

                    packageUnit:
                      variant.packageUnit ||
                      "",

                    active:
                      variant.active !==
                      false,
                  })
                )
              : [
                  {
                    ...EMPTY_VARIANT,
                  },
                ],

          active:
            product.active !==
            false,

          stockStatus:
            product.stockStatus ||
            "in_stock",

          isNew:
            product.isNew === true,

          isHot:
            product.isHot === true,

          featured:
            product.featured ===
            true,

          sortOrder:
            Number(
              product.sortOrder || 0
            ),
        });
      } catch (err) {
        console.error(
          "Load product error:",
          err
        );

        setError(
          err.message ||
            "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  /*
   * LOAD CATEGORIES
   */
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);

        const response =
          await fetch(
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
          Array.isArray(
            data.categories
          )
            ? data.categories
            : []
        );
      } catch (err) {
        console.error(
          "Load categories error:",
          err
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  /*
   * GENERAL FIELD CHANGE
   */
  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  /*
   * CATEGORY CHANGE
   */
  function handleCategoryChange(
    event
  ) {
    const categoryId =
      event.target.value;

    const selectedCategory =
      categories.find(
        (category) =>
          category.id ===
          categoryId
      );

    setForm((current) => ({
      ...current,
      categoryId,
      categoryName:
        selectedCategory?.name ||
        "",
    }));
  }

  /*
   * REMOVE EXISTING IMAGE
   */
  function removeImage(index) {
    setForm((current) => ({
      ...current,
      images:
        current.images.filter(
          (_, imageIndex) =>
            imageIndex !== index
        ),
    }));
  }

  /*
   * IMAGE ALT CHANGE
   */
  function handleImageAltChange(
    index,
    value
  ) {
    setForm((current) => {
      const images = [
        ...current.images,
      ];

      images[index] = {
        ...images[index],
        alt: value,
      };

      return {
        ...current,
        images,
      };
    });
  }

  /*
   * CLOUDINARY UPLOAD SUCCESS
   */
  function handleUploadSuccess(
    result
  ) {
    const info =
      result?.info;

    if (!info?.secure_url) {
      console.error(
        "Cloudinary upload returned no secure URL:",
        result
      );

      setUploadError(
        "Image uploaded but no image URL was returned."
      );

      return;
    }

    const newImage = {
      url: info.secure_url,
      alt:
        info.original_filename ||
        "",
    };

    setForm((current) => ({
      ...current,
      images: [
        ...current.images,
        newImage,
      ],
    }));

    setUploadError("");
  }

  /*
   * VARIANT CHANGE
   */
  function handleVariantChange(
    index,
    field,
    value
  ) {
    setForm((current) => {
      const variants = [
        ...current.variants,
      ];

      variants[index] = {
        ...variants[index],
        [field]: value,
      };

      return {
        ...current,
        variants,
      };
    });
  }

  /*
   * ADD VARIANT
   */
  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          ...EMPTY_VARIANT,
        },
      ],
    }));
  }

  /*
   * REMOVE VARIANT
   */
  function removeVariant(index) {
    setForm((current) => {
      if (
        current.variants.length ===
        1
      ) {
        return current;
      }

      return {
        ...current,
        variants:
          current.variants.filter(
            (_, variantIndex) =>
              variantIndex !== index
          ),
      };
    });
  }

  /*
   * VALIDATE
   */
  function validateForm() {
    if (!form.name.trim()) {
      return "Product name is required.";
    }

    if (!form.description.trim()) {
      return "Product description is required.";
    }

    if (!form.categoryId) {
      return "Please select a category.";
    }

    if (!form.variants.length) {
      return "At least one product variant is required.";
    }

    for (
      let index = 0;
      index < form.variants.length;
      index++
    ) {
      const variant =
        form.variants[index];

      if (
        !variant.label?.trim()
      ) {
        return `Variant ${
          index + 1
        } needs a package label.`;
      }

      const price =
        Number(
          variant.price
        );

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return `Variant ${
          index + 1
        } needs a valid price.`;
      }
    }

    return "";
  }

  /*
   * SAVE PRODUCT
   */
  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    console.log(
      "SAVE PRODUCT CHANGES CLICKED"
    );

    setError("");
    setSuccessMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name:
          form.name.trim(),

        description:
          form.description.trim(),

        categoryId:
          form.categoryId,

        categoryName:
          form.categoryName,

        images:
          form.images
            .filter(
              (image) =>
                image?.url?.trim()
            )
            .map((image) => ({
              url:
                image.url.trim(),

              alt:
                image.alt?.trim() ||
                "",
            })),

        variants:
          form.variants.map(
            (variant) => ({
              id:
                variant.id ||
                "",

              label:
                variant.label.trim(),

              price:
                Number(
                  variant.price
                ),

              packageSize:
                variant.packageSize
                  ? Number(
                      variant.packageSize
                    )
                  : null,

              packageUnit:
                variant.packageUnit
                  ?.trim() ||
                null,

              active:
                variant.active !==
                false,
            })
          ),

        active:
          form.active,

        stockStatus:
          form.stockStatus,

        isNew:
          form.isNew,

        isHot:
          form.isHot,

        featured:
          form.featured,

        sortOrder:
          Number(
            form.sortOrder || 0
          ),
      };

      console.log(
        "Updating product:",
        payload
      );

      const response =
        await fetch(
          `/api/admin/products/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await response.json();

      console.log(
        "Update product response:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        const validationDetails =
          data.fields
            ? Object.values(
                data.fields
              ).join(" ")
            : "";

        throw new Error(
          validationDetails ||
            data.error ||
            "Unable to update product."
        );
      }

      setSuccessMessage(
        "Product updated successfully."
      );

      setTimeout(() => {
        router.push(
          "/dashboard/admin/products"
        );

        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "Update product error:",
        err
      );

      setError(
        err.message ||
          "Unable to update product."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * DEACTIVATE PRODUCT
   */
  async function handleDeactivate() {
    const confirmed =
      window.confirm(
        "Are you sure you want to deactivate this product? Customers will no longer see it in the active catalogue."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeactivating(true);
      setError("");
      setSuccessMessage("");

      const response =
        await fetch(
          `/api/admin/products/${productId}`,
          {
            method: "DELETE",
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
            "Unable to deactivate product."
        );
      }

      setSuccessMessage(
        "Product deactivated successfully."
      );

      setForm((current) => ({
        ...current,
        active: false,
      }));
    } catch (err) {
      console.error(
        "Deactivate product error:",
        err
      );

      setError(
        err.message ||
          "Unable to deactivate product."
      );
    } finally {
      setDeactivating(false);
    }
  }

  /*
   * LOADING STATE
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] pt-16 lg:pt-0">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Loading product...
          </div>

          <div className="mt-6 space-y-5">
            <div className="h-40 animate-pulse rounded-3xl bg-[#F0EEE7]" />
            <div className="h-64 animate-pulse rounded-3xl bg-[#F0EEE7]" />
            <div className="h-80 animate-pulse rounded-3xl bg-[#F0EEE7]" />
          </div>
        </div>
      </main>
    );
  }

  /*
   * ERROR / PRODUCT NOT FOUND
   */
  if (error && !form.name) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] pt-16 lg:pt-0">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#68912B]"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-700 underline"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-16 lg:pt-0">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* HEADER */}
        <div>
          <Link
            href="/dashboard/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#68912B] hover:text-[#B22625]"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22625]">
              Catalogue Management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
              Edit Product
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Update this product's catalogue
              information, images, packages and
              storefront settings.
            </p>
          </div>
        </div>

        {/* SUCCESS */}
        {successMessage ? (
          <div className="mt-6 rounded-2xl border border-[#CFE1BC] bg-[#EDF4E4] p-4">
            <p className="text-sm font-semibold text-[#68912B]">
              {successMessage}
            </p>
          </div>
        ) : null}

        {/* ERROR */}
        {error ? (
          <div className="mt-6 rounded-2xl border border-[#F1C7C7] bg-[#FFF4F4] p-4">
            <p className="text-sm font-semibold text-[#B22625]">
              {error}
            </p>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >

          {/* PRODUCT INFORMATION */}
          <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4E4]">
                <Package
                  size={20}
                  className="text-[#68912B]"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#1F1F1F]">
                  Product Information
                </h2>

                <p className="text-xs text-gray-500">
                  Update the information customers
                  see.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">

              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-bold text-[#1F1F1F]"
                >
                  Product Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  disabled={submitting}
                  className="mt-2 h-12 w-full rounded-xl border border-[#E7E4DC] px-4 text-sm outline-none transition focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] disabled:bg-gray-50"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="description"
                  className="text-sm font-bold text-[#1F1F1F]"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  disabled={submitting}
                  className="mt-2 w-full resize-y rounded-xl border border-[#E7E4DC] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] disabled:bg-gray-50"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="text-sm font-bold text-[#1F1F1F]"
                >
                  Category
                </label>

                <select
                  id="categoryId"
                  value={form.categoryId}
                  onChange={
                    handleCategoryChange
                  }
                  disabled={
                    submitting ||
                    loadingCategories
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#E7E4DC] bg-white px-4 text-sm outline-none transition focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4] disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </section>

          {/* IMAGES */}
          <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-7">
            <div>
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                Product Images
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Existing images are preserved. Add new
                images or remove images you no longer
                want.
              </p>
            </div>

            {/* CURRENT IMAGES */}
            {form.images.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {form.images.map(
                  (image, index) => (
                    <div
                      key={`${image.url}-${index}`}
                      className="overflow-hidden rounded-2xl border border-[#E7E4DC] bg-[#FAF9F5]"
                    >
                      <div className="relative h-48 bg-[#F5F3EC]">
                        <img
                          src={image.url}
                          alt={
                            image.alt ||
                            `Product image ${
                              index + 1
                            }`
                          }
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              index
                            )
                          }
                          disabled={
                            submitting
                          }
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#B22625] shadow-md transition hover:bg-[#FFF0F0] disabled:opacity-50"
                          aria-label={`Remove image ${
                            index + 1
                          }`}
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>

                      <div className="p-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                          Image{" "}
                          {index + 1}
                        </p>

                        <input
                          type="text"
                          value={
                            image.alt ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleImageAltChange(
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Image alt text"
                          disabled={
                            submitting
                          }
                          className="h-10 w-full rounded-lg border border-[#E7E4DC] bg-white px-3 text-xs outline-none focus:border-[#68912B]"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-[#D9D5C9] bg-[#FAF9F5] px-5 py-10 text-center">
                <ImagePlus
                  size={30}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm font-semibold text-gray-500">
                  No product images
                </p>
              </div>
            )}

            {/* CLOUDINARY UPLOAD */}
            <CldUploadWidget
              signatureEndpoint="/api/admin/cloudinary/sign"
              options={{
                multiple: true,
                maxFiles: 10,
                resourceType: "image",
                clientAllowedFormats: [
                  "jpg",
                  "jpeg",
                  "png",
                  "webp",
                  "avif",
                ],
                maxFileSize:
                  10 * 1024 * 1024,
                folder:
                  "loreshi-foodhub/products",
              }}
              onOpen={() => {
                setUploadError("");
              }}
              onQueuesStart={() => {
                setUploadingImages(
                  true
                );
              }}
              onQueuesEnd={() => {
                setUploadingImages(
                  false
                );
              }}
              onError={(uploadError) => {
                console.error(
                  "Cloudinary edit upload error:",
                  uploadError
                );

                setUploadingImages(
                  false
                );

                setUploadError(
                  "Unable to upload one or more images. Please try again."
                );
              }}
              onSuccess={(result) => {
                handleUploadSuccess(
                  result
                );
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() =>
                    open()
                  }
                  disabled={
                    uploadingImages ||
                    submitting
                  }
                  className="mt-5 flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D9D5C9] bg-[#FAF9F5] px-5 py-7 text-center transition hover:border-[#68912B] hover:bg-[#EDF4E4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingImages ? (
                    <>
                      <RefreshCw
                        size={28}
                        className="animate-spin text-[#68912B]"
                      />

                      <p className="mt-3 text-sm font-bold text-[#1F1F1F]">
                        Uploading images...
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Please wait until the
                        uploads finish.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EDF4E4]">
                        <UploadCloud
                          size={23}
                          className="text-[#68912B]"
                        />
                      </div>

                      <p className="mt-3 text-sm font-bold text-[#1F1F1F]">
                        Add More Images
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Select JPG, PNG, WebP or
                        AVIF images
                      </p>
                    </>
                  )}
                </button>
              )}
            </CldUploadWidget>

            {uploadError ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs font-semibold text-red-700">
                  {uploadError}
                </p>
              </div>
            ) : null}
          </section>

          {/* VARIANTS */}
          <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1F1F1F]">
                  Packages & Prices
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Update the packages customers can
                  purchase.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#68912B] px-4 text-sm font-bold text-white transition hover:bg-[#557A22] disabled:opacity-50"
              >
                <Plus size={16} />
                Add Variant
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {form.variants.map(
                (variant, index) => (
                  <div
                    key={
                      variant.id ||
                      index
                    }
                    className="rounded-2xl border border-[#E7E4DC] bg-[#FAF9F5] p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                        Variant{" "}
                        {index + 1}
                      </p>

                      {form.variants
                        .length >
                      1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            removeVariant(
                              index
                            )
                          }
                          disabled={
                            submitting
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#B22625] disabled:opacity-50"
                        >
                          <Trash2
                            size={14}
                          />
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-[#1F1F1F]">
                          Package Label
                        </label>

                        <input
                          type="text"
                          value={
                            variant.label
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "label",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            submitting
                          }
                          placeholder="e.g. 1kg Bag"
                          className="mt-2 h-11 w-full rounded-xl border border-[#E7E4DC] bg-white px-3 text-sm outline-none focus:border-[#68912B]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#1F1F1F]">
                          Price (₦)
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            variant.price
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "price",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            submitting
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-[#E7E4DC] bg-white px-3 text-sm outline-none focus:border-[#68912B]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#1F1F1F]">
                          Package Size
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            variant.packageSize
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "packageSize",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            submitting
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-[#E7E4DC] bg-white px-3 text-sm outline-none focus:border-[#68912B]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#1F1F1F]">
                          Package Unit
                        </label>

                        <input
                          type="text"
                          value={
                            variant.packageUnit
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "packageUnit",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            submitting
                          }
                          placeholder="kg, g, litre, pack..."
                          className="mt-2 h-11 w-full rounded-xl border border-[#E7E4DC] bg-white px-3 text-sm outline-none focus:border-[#68912B]"
                        />
                      </div>
                    </div>

                    <label className="mt-4 flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={
                          variant.active !==
                          false
                        }
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            index,
                            "active",
                            event
                              .target
                              .checked
                          )
                        }
                        disabled={
                          submitting
                        }
                        className="h-4 w-4 rounded border-gray-300 accent-[#68912B]"
                      />

                      <span className="text-sm font-semibold text-[#1F1F1F]">
                        Variant is active
                      </span>
                    </label>
                  </div>
                )
              )}
            </div>
          </section>

          {/* STOREFRONT SETTINGS */}
          <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-7">
            <div>
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                Storefront Settings
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Control how this product appears in
                your catalogue.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* STOCK */}
              <div>
                <label
                  htmlFor="stockStatus"
                  className="text-sm font-bold text-[#1F1F1F]"
                >
                  Stock Status
                </label>

                <select
                  id="stockStatus"
                  name="stockStatus"
                  value={
                    form.stockStatus
                  }
                  onChange={handleChange}
                  disabled={
                    submitting
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-[#E7E4DC] bg-white px-3 text-sm outline-none focus:border-[#68912B]"
                >
                  {STOCK_OPTIONS.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* SORT ORDER */}
              <div>
                <label
                  htmlFor="sortOrder"
                  className="text-sm font-bold text-[#1F1F1F]"
                >
                  Sort Order
                </label>

                <input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  value={
                    form.sortOrder
                  }
                  onChange={handleChange}
                  disabled={
                    submitting
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-[#E7E4DC] bg-white px-3 text-sm outline-none focus:border-[#68912B]"
                />
              </div>
            </div>

            {/* TOGGLES */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E7E4DC] p-4">
                <div>
                  <p className="text-sm font-bold text-[#1F1F1F]">
                    Active Product
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Customers can see this product.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="active"
                  checked={
                    form.active
                  }
                  onChange={handleChange}
                  disabled={
                    submitting
                  }
                  className="h-5 w-5 rounded accent-[#68912B]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E7E4DC] p-4">
                <div>
                  <p className="text-sm font-bold text-[#1F1F1F]">
                    New Product
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Show the NEW badge.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="isNew"
                  checked={
                    form.isNew
                  }
                  onChange={handleChange}
                  disabled={
                    submitting
                  }
                  className="h-5 w-5 rounded accent-[#68912B]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E7E4DC] p-4">
                <div>
                  <p className="text-sm font-bold text-[#1F1F1F]">
                    Hot Product
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Show the HOT badge.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="isHot"
                  checked={
                    form.isHot
                  }
                  onChange={handleChange}
                  disabled={
                    submitting
                  }
                  className="h-5 w-5 rounded accent-[#68912B]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E7E4DC] p-4">
                <div>
                  <p className="text-sm font-bold text-[#1F1F1F]">
                    Featured Product
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Include in featured sections.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="featured"
                  checked={
                    form.featured
                  }
                  onChange={handleChange}
                  disabled={
                    submitting
                  }
                  className="h-5 w-5 rounded accent-[#68912B]"
                />
              </label>
            </div>
          </section>

          {/* ACTIONS */}
          <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={
                  handleDeactivate
                }
                disabled={
                  deactivating ||
                  submitting ||
                  form.active === false
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#F1C7C7] bg-[#FFF4F4] px-5 text-sm font-bold text-[#B22625] transition hover:bg-[#FFF0F0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deactivating ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <XCircle
                      size={17}
                    />
                    Deactivate Product
                  </>
                )}
              </button>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Link
                  href="/dashboard/admin/products"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E7E4DC] bg-white px-6 text-sm font-bold text-[#1F1F1F] transition hover:bg-[#F5F3EC]"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    uploadingImages
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-7 text-sm font-bold text-white transition hover:bg-[#8F1D1D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
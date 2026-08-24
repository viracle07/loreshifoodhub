"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import {
    ArrowLeft,
    ImagePlus,
    Package,
    Plus,
    RefreshCw,
    Save,
    Trash2,
    UploadCloud,
    X,
} from "lucide-react";

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

export default function NewProductPage() {
    const router = useRouter();

    const [categories, setCategories] = useState(
        []
    );

    const [loadingCategories, setLoadingCategories] =
        useState(true);

    const [categoriesError, setCategoriesError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [uploadingImages, setUploadingImages] =
        useState(false);

    const [uploadError, setUploadError] =
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
     * LOAD CATEGORIES
     */
    useEffect(() => {
        async function loadCategories() {
            try {
                setLoadingCategories(true);
                setCategoriesError("");

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
            } catch (error) {
                console.error(
                    "Load product categories error:",
                    error
                );

                setCategoriesError(
                    error.message ||
                    "Unable to load categories."
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
    function handleCategoryChange(event) {
        const categoryId =
            event.target.value;

        const selectedCategory =
            categories.find(
                (category) =>
                    category.id === categoryId
            );

        setForm((current) => ({
            ...current,
            categoryId,
            categoryName:
                selectedCategory?.name || "",
        }));
    }

    /*
     * CLOUDINARY UPLOAD SUCCESS
     */
    function handleUploadSuccess(result) {
        const info = result?.info;

        if (!info?.secure_url) {
            return;
        }

        setForm((current) => {
            const alreadyExists =
                current.images.some(
                    (image) =>
                        image.publicId ===
                        info.public_id
                );

            if (alreadyExists) {
                return current;
            }

            return {
                ...current,
                images: [
                    ...current.images,
                    {
                        url: info.secure_url,
                        publicId:
                            info.public_id || "",
                        alt:
                            current.name.trim() ||
                            "Product image",
                    },
                ],
            };
        });

        setUploadError("");
    }

    /*
     * REMOVE CLOUDINARY IMAGE FROM FORM
     *
     * This removes it from the product form.
     *
     * It does NOT delete the Cloudinary asset.
     * We will handle asset cleanup later when
     * the Edit Product system is built.
     */
    function removeImage(index) {
        setForm((current) => ({
            ...current,
            images: current.images.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            ),
        }));
    }

    /*
     * UPDATE IMAGE ALT TEXT
     */
    function updateImageAlt(
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
            if (current.variants.length === 1) {
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

            if (!variant.label.trim()) {
                return `Variant ${index + 1
                    } needs a package label.`;
            }

            const price = Number(
                variant.price
            );

            if (
                !Number.isFinite(price) ||
                price < 0
            ) {
                return `Variant ${index + 1
                    } needs a valid price.`;
            }
        }

        return "";
    }

    /*
     * SUBMIT
     */
   async function handleSubmit(event) {
  console.log("SAVE PRODUCT BUTTON CLICKED");

  event.preventDefault();

  setSubmitError("");
  setSuccessMessage("");

  console.log("FORM DATA:", form);

  const validationError =
    validateForm();

  console.log(
    "VALIDATION RESULT:",
    validationError
  );

  if (validationError) {
    console.log(
      "PRODUCT VALIDATION FAILED:",
      validationError
    );

    setSubmitError(validationError);
    return;
  }

  try {
    console.log(
      "PRODUCT VALIDATION PASSED"
    );

    setSubmitting(true);

    const payload = {
      name: form.name.trim(),

      description:
        form.description.trim(),

      categoryId:
        form.categoryId,

      categoryName:
        form.categoryName,

      images: form.images
        .filter(
          (image) =>
            image.url?.trim()
        )
        .map((image) => ({
          url: image.url.trim(),
          alt:
            image.alt?.trim() || "",
        })),

      variants: form.variants.map(
        (variant) => ({
          label:
            variant.label.trim(),

          price: Number(
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
              ?.trim() || null,

          active:
            variant.active !== false,
        })
      ),

      active: form.active,
      stockStatus: form.stockStatus,
      isNew: form.isNew,
      isHot: form.isHot,
      featured: form.featured,

      sortOrder: Number(
        form.sortOrder || 0
      ),
    };

    console.log(
      "PRODUCT PAYLOAD:",
      payload
    );

    console.log(
      "SENDING POST /api/admin/products"
    );

    const response =
      await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

    console.log(
      "PRODUCT API STATUS:",
      response.status
    );

    const data =
      await response.json();

    console.log(
      "PRODUCT API RESPONSE:",
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
          "Unable to create product."
      );
    }

    console.log(
      "PRODUCT CREATED SUCCESSFULLY"
    );

    setSuccessMessage(
      "Product created successfully."
    );

    setTimeout(() => {
      router.push(
        "/dashboard/admin/products"
      );

      router.refresh();
    }, 700);
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    setSubmitError(
      error.message ||
        "Unable to create product."
    );
  } finally {
    setSubmitting(false);
  }
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
                            Add Product
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Add a new product to the
                            Loreshi FoodHub catalogue.
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
                {submitError ? (
                    <div className="mt-6 rounded-2xl border border-[#F1C7C7] bg-[#FFF4F4] p-4">
                        <p className="text-sm font-semibold text-[#B22625]">
                            {submitError}
                        </p>
                    </div>
                ) : null}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6"
                >

                    {/* BASIC INFORMATION */}
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
                                    Basic information customers
                                    will see.
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
                                    placeholder="e.g. Premium Nigerian Rice"
                                    className="mt-2 h-12 w-full rounded-xl border border-[#E7E4DC] px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4]"
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
                                    placeholder="Describe the product..."
                                    className="mt-2 w-full resize-y rounded-xl border border-[#E7E4DC] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-[#68912B] focus:ring-2 focus:ring-[#EDF4E4]"
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

                                {categoriesError ? (
                                    <p className="mt-2 text-xs font-medium text-[#B22625]">
                                        {categoriesError}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </section>

                    {/* CLOUDINARY IMAGES */}
                    <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-7">
                        <div>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-[#1F1F1F]">
                                        Product Images
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Upload multiple product images
                                        directly to Cloudinary.
                                    </p>
                                </div>

                                <div className="hidden rounded-xl bg-[#EDF4E4] p-3 sm:block">
                                    <ImagePlus
                                        size={20}
                                        className="text-[#68912B]"
                                    />
                                </div>
                            </div>

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
                                    setUploadingImages(true);
                                    setUploadError("");
                                }}
                                onQueuesEnd={() => {
                                    setUploadingImages(false);
                                }}
                                onError={(error) => {
                                    console.error(
                                        "Cloudinary upload error:",
                                        error
                                    );

                                    console.error(
                                        "Cloudinary upload error JSON:",
                                        JSON.stringify(
                                            error,
                                            Object.getOwnPropertyNames(error),
                                            2
                                        )
                                    );

                                    console.error(
                                        "Cloudinary upload error message:",
                                        error?.message
                                    );

                                    console.error(
                                        "Cloudinary upload error details:",
                                        error?.status,
                                        error?.statusText,
                                        error?.event,
                                        error?.info
                                    );

                                    setUploadingImages(false);

                                    setUploadError(
                                        error?.message ||
                                        "Unable to upload one or more images. Please try again."
                                    );
                                }}
                                onSuccess={(result) => {
                                    console.log(
                                        "Cloudinary upload successful:",
                                        result
                                    );

                                    handleUploadSuccess(result);
                                }}
                            >
                                {({ open }) => (
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        disabled={uploadingImages}
                                        className="mt-5 flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D9D5C9] bg-[#FAF9F5] px-5 py-8 text-center transition hover:border-[#68912B] hover:bg-[#EDF4E4] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {uploadingImages ? (
                                            <>
                                                <RefreshCw
                                                    size={30}
                                                    className="animate-spin text-[#68912B]"
                                                />

                                                <p className="mt-3 text-sm font-bold text-[#1F1F1F]">
                                                    Uploading images...
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Please wait until all
                                                    uploads finish.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF4E4]">
                                                    <UploadCloud
                                                        size={24}
                                                        className="text-[#68912B]"
                                                    />
                                                </div>

                                                <p className="mt-3 text-sm font-bold text-[#1F1F1F]">
                                                    Upload Product Images
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Select multiple JPG, PNG,
                                                    WebP or AVIF images
                                                </p>

                                                <p className="mt-1 text-[11px] text-gray-400">
                                                    Maximum 10 images • 10MB
                                                    each
                                                </p>
                                            </>
                                        )}
                                    </button>
                                )}
                            </CldUploadWidget>

                            {uploadError ? (
                                <div className="mt-4 rounded-xl border border-[#F1C7C7] bg-[#FFF4F4] p-3">
                                    <p className="text-xs font-semibold text-[#B22625]">
                                        {uploadError}
                                    </p>
                                </div>
                            ) : null}

                            {/* UPLOADED IMAGES */}
                            {form.images.length > 0 ? (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-[#1F1F1F]">
                                            Uploaded Images
                                        </p>

                                        <p className="text-xs font-medium text-gray-500">
                                            {form.images.length}{" "}
                                            {form.images.length ===
                                                1
                                                ? "image"
                                                : "images"}
                                        </p>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {form.images.map(
                                            (
                                                image,
                                                index
                                            ) => (
                                                <div
                                                    key={
                                                        image.publicId ||
                                                        `${image.url}-${index}`
                                                    }
                                                    className="group relative overflow-hidden rounded-2xl border border-[#E7E4DC] bg-[#F5F3EC]"
                                                >
                                                    <div className="aspect-square">
                                                        <img
                                                            src={
                                                                image.url
                                                            }
                                                            alt={
                                                                image.alt ||
                                                                form.name ||
                                                                `Product image ${index +
                                                                1
                                                                }`
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>

                                                    {/* MAIN IMAGE */}
                                                    {index === 0 ? (
                                                        <span className="absolute left-2 top-2 rounded-full bg-[#68912B] px-2 py-1 text-[10px] font-bold text-white">
                                                            Main
                                                        </span>
                                                    ) : null}

                                                    {/* REMOVE */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeImage(
                                                                index
                                                            )
                                                        }
                                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#B22625] shadow-sm transition hover:bg-[#B22625] hover:text-white"
                                                        aria-label={`Remove image ${index +
                                                            1
                                                            }`}
                                                    >
                                                        <X
                                                            size={15}
                                                        />
                                                    </button>

                                                    <div className="border-t border-[#E7E4DC] bg-white p-2">
                                                        <input
                                                            type="text"
                                                            value={
                                                                image.alt ||
                                                                ""
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateImageAlt(
                                                                    index,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Alt text"
                                                            className="h-9 w-full rounded-lg border border-[#E7E4DC] px-2 text-[11px] outline-none focus:border-[#68912B]"
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </section>

                    {/* VARIANTS */}
                    <section className="rounded-3xl border border-[#E7E4DC] bg-white p-5 sm:p-7">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#1F1F1F]">
                                    Packages & Prices
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Add every package size customers
                                    can purchase.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addVariant}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#68912B] px-4 text-sm font-bold text-white transition hover:bg-[#557A22]"
                            >
                                <Plus size={16} />
                                Add Variant
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            {form.variants.map(
                                (variant, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-[#E7E4DC] bg-[#FAF9F5] p-4 sm:p-5"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                                                Variant{" "}
                                                {index + 1}
                                            </p>

                                            {form.variants.length >
                                                1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeVariant(
                                                            index
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#B22625]"
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
                                                    onChange={(event) =>
                                                        handleVariantChange(
                                                            index,
                                                            "label",
                                                            event.target
                                                                .value
                                                        )
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
                                                    onChange={(event) =>
                                                        handleVariantChange(
                                                            index,
                                                            "price",
                                                            event.target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="5000"
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
                                                    onChange={(event) =>
                                                        handleVariantChange(
                                                            index,
                                                            "packageSize",
                                                            event.target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="1"
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
                                                    onChange={(event) =>
                                                        handleVariantChange(
                                                            index,
                                                            "packageUnit",
                                                            event.target
                                                                .value
                                                        )
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
                                                onChange={(event) =>
                                                    handleVariantChange(
                                                        index,
                                                        "active",
                                                        event.target
                                                            .checked
                                                    )
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
                                        Customers can see this
                                        product.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={form.active}
                                    onChange={handleChange}
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
                                    checked={form.isNew}
                                    onChange={handleChange}
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
                                    checked={form.isHot}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded accent-[#68912B]"
                                />
                            </label>

                            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E7E4DC] p-4">
                                <div>
                                    <p className="text-sm font-bold text-[#1F1F1F]">
                                        Featured Product
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Include in featured
                                        sections.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={
                                        form.featured
                                    }
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded accent-[#68912B]"
                                />
                            </label>
                        </div>
                    </section>

                    {/* SUBMIT */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/dashboard/admin/products"
                            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E7E4DC] bg-white px-6 text-sm font-bold text-[#1F1F1F] transition hover:bg-[#F5F3EC]"
                        >
                            Cancel
                        </Link>

                       <button
  type="button"
  onClick={handleSubmit}
  disabled={submitting}
  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#B22625] px-7 text-sm font-bold text-white transition hover:bg-[#8F1D1D] disabled:cursor-not-allowed disabled:opacity-60"
>
  {submitting ? (
    <>
      <RefreshCw
        size={17}
        className="animate-spin"
      />
      Saving Product...
    </>
  ) : (
    <>
      <Save size={17} />
      Save Product
    </>
  )}
</button>
                    </div>
                </form>
            </div>
        </main>
    );
}
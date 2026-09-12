"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string | null;
  recipient?: string | null;
  occasion?: string | null;
  image: string;
  images?: string[];
  isNew: boolean;
  isActive: boolean;
  stock: number;
  youtubeVideo?: string | null;
  materials?: string | null;
  shipping?: string | null;
  returns?: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  recipient: string;
  occasion: string;
  image: string;
  images: string[];
  stock: string;
  isNew: boolean;
  isActive: boolean;
  youtubeVideo: string;
  materials: string;
  shipping: string;
  returns: string;
};

const RECIPIENT_OPTIONS = [
  "For Her",
  "For Him",
  "For Kids",
  "Couples",
  "Parents",
  "Friends",
];

const OCCASION_OPTIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Thank You",
  "Just Because",
  "Holiday",
];

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  recipient: "",
  occasion: "",
  image: "",
  images: [],
  stock: "10",
  isNew: false,
  isActive: true,
  youtubeVideo: "",
  materials: "",
  shipping: "",
  returns: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<
    | "newest"
    | "nameAsc"
    | "nameDesc"
    | "priceAsc"
    | "priceDesc"
    | "stockAsc"
    | "stockDesc"
  >("newest");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [seeding, setSeeding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [seedMessage, setSeedMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setError("");

      const response = await fetch(
        "/api/admin/products",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load products."
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      setCategoriesLoading(true);

      const response = await fetch(
        "/api/admin/categories",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load categories."
        );
      }

      setCategories(
        (data.categories || []).filter(
          (category: Category) => category.isActive
        )
      );
    } catch (err) {
      console.error(
        "Unable to load categories:",
        err
      );

      setCategories([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, statusFilter]);

  function clearMessages() {
    setError("");
    setSuccessMessage("");
    setSeedMessage("");
  }

  function updateForm(
    field: keyof ProductForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSeedProducts() {
    try {
      setSeeding(true);
      clearMessages();

      const response = await fetch(
        "/api/admin/products/seed",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to import products."
        );
      }

      setSeedMessage(
        `Catalog imported successfully. Created: ${data.created}, Skipped: ${data.skipped}.`
      );

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to import products."
      );
    } finally {
      setSeeding(false);
    }
  }

  async function handleCreateProduct(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    clearMessages();

    if (!form.name.trim()) {
      return setError(
        "Product name is required."
      );
    }

    if (!form.category) {
      return setError(
        "Please select a category."
      );
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      return setError(
        "Please enter a valid product price."
      );
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return setError(
        "Stock must be a valid whole number."
      );
    }

    try {
      setCreating(true);

      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description:
              form.description.trim(),
            price: form.price,
            category: form.category,

            recipient:
              form.recipient.trim() || null,

            occasion:
              form.occasion.trim() || null,

            image:
              form.images[0] ||
              form.image.trim(),

            images: form.images,

            stock: form.stock,
            isNew: form.isNew,
            isActive: form.isActive,

            youtubeVideo:
              form.youtubeVideo.trim(),

            materials:
              form.materials.trim() || null,

            shipping:
              form.shipping.trim() || null,

            returns:
              form.returns.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create product."
        );
      }

      setSuccessMessage(
        "Product created successfully."
      );

      setForm(emptyForm);
      setShowAddForm(false);

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create product."
      );
    } finally {
      setCreating(false);
    }
  }

  function openEditForm(product: Product) {
    clearMessages();

    setEditingProduct(product);

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,

      recipient:
        product.recipient || "",

      occasion:
        product.occasion || "",

      image: product.image,

      images:
        product.images &&
        product.images.length > 0
          ? product.images
          : product.image
          ? [product.image]
          : [],

      stock: String(product.stock),
      isNew: product.isNew,
      isActive: product.isActive,

      youtubeVideo:
        product.youtubeVideo || "",

      materials:
        product.materials || "",

      shipping:
        product.shipping || "",

      returns:
        product.returns || "",
    });

    setShowEditForm(true);
  }

  function closeEditForm() {
    if (updating) return;

    setShowEditForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
  }

  async function handleUpdateProduct(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingProduct) return;

    clearMessages();

    if (!form.name.trim()) {
      return setError(
        "Product name is required."
      );
    }

    if (!form.category) {
      return setError(
        "Please select a category."
      );
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      return setError(
        "Please enter a valid product price."
      );
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return setError(
        "Stock must be a valid whole number."
      );
    }

    try {
      setUpdating(true);

      const response = await fetch(
        `/api/admin/products/${editingProduct.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),

            description:
              form.description.trim(),

            price: form.price,

            category: form.category,

            recipient:
              form.recipient.trim() || null,

            occasion:
              form.occasion.trim() || null,

            image:
              form.images[0] ||
              form.image.trim(),

            images: form.images,

            stock: form.stock,

            isNew: form.isNew,

            isActive: form.isActive,

            youtubeVideo:
              form.youtubeVideo.trim(),

            materials:
              form.materials.trim() || null,

            shipping:
              form.shipping.trim() || null,

            returns:
              form.returns.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update product."
        );
      }

      setSuccessMessage(
        "Product updated successfully."
      );

      setShowEditForm(false);
      setEditingProduct(null);
      setForm(emptyForm);

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product."
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleToggleProduct(
    product: Product
  ) {
    try {
      setTogglingId(product.id);
      clearMessages();

      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            isActive: !product.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update product status."
        );
      }

      setSuccessMessage(
        product.isActive
          ? "Product hidden successfully."
          : "Product activated successfully."
      );

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product status."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDeleteProduct(
    product: Product
  ) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product.id);
      clearMessages();

      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete product."
        );
      }

      setSuccessMessage(
        "Product deleted successfully."
      );

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const activeProducts =
    products.filter(
      (product) => product.isActive
    ).length;

  const lowStockProducts =
    products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= 5
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) => product.stock <= 0
    ).length;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const filteredProducts = products
    .filter((product) => {
      if (statusFilter === "active") {
        return product.isActive;
      }

      if (statusFilter === "inactive") {
        return !product.isActive;
      }

      return true;
    })
    .filter((product) => {
      const term =
        searchTerm.trim().toLowerCase();

      if (!term) return true;

      return (
        product.name
          .toLowerCase()
          .includes(term) ||
        product.category
          .toLowerCase()
          .includes(term)
      );
    });

  const sortedProducts = [
    ...filteredProducts,
  ].sort((a, b) => {
    switch (sortField) {
      case "nameAsc":
        return a.name.localeCompare(b.name);

      case "nameDesc":
        return b.name.localeCompare(a.name);

      case "priceAsc":
        return a.price - b.price;

      case "priceDesc":
        return b.price - a.price;

      case "stockAsc":
        return a.stock - b.stock;

      case "stockDesc":
        return b.stock - a.stock;

      case "newest":
      default:
        return b.id.localeCompare(a.id);
    }
  });

  const totalProducts =
    sortedProducts.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / pageSize)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const pageStart =
    (safeCurrentPage - 1) * pageSize;

  const paginatedProducts =
    sortedProducts.slice(
      pageStart,
      pageStart + pageSize
    );

  const showingFrom =
    totalProducts === 0
      ? 0
      : pageStart + 1;

  const showingTo = Math.min(
    pageStart + pageSize,
    totalProducts
  );

  function getPageNumbers(): (
    | number
    | "ellipsis-left"
    | "ellipsis-right"
  )[] {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (safeCurrentPage <= 3) {
      return [
        1,
        2,
        3,
        4,
        "ellipsis-right",
        totalPages,
      ];
    }

    if (
      safeCurrentPage >=
      totalPages - 2
    ) {
      return [
        1,
        "ellipsis-left",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis-left",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "ellipsis-right",
      totalPages,
    ];
  }

  function renderProductForm(
    isEdit: boolean
  ) {
    return (
      <form
        onSubmit={
          isEdit
            ? handleUpdateProduct
            : handleCreateProduct
        }
        className="space-y-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Product Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                updateForm(
                  "name",
                  event.target.value
                )
              }
              placeholder="e.g. Premium Leather Bag"
              required
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-neutral-700">
                Category
              </label>

              {!isEdit ? (
                <Link
                  href="/admin/categories"
                  className="text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-black"
                >
                  Manage categories
                </Link>
              ) : null}
            </div>

            <select
              value={form.category}
              onChange={(event) =>
                updateForm(
                  "category",
                  event.target.value
                )
              }
              required
              disabled={
                categoriesLoading ||
                categories.length === 0
              }
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : categories.length === 0
                  ? "No active categories"
                  : "Select a category"}
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Recipient */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Recipient
              <span className="ml-1 font-normal text-neutral-400">
                (optional)
              </span>
            </label>

            <select
              value={form.recipient}
              onChange={(event) =>
                updateForm(
                  "recipient",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
            >
              <option value="">
                Select recipient
              </option>

              {RECIPIENT_OPTIONS.map(
                (recipient) => (
                  <option
                    key={recipient}
                    value={recipient}
                  >
                    {recipient}
                  </option>
                )
              )}
            </select>

            <p className="mt-2 text-xs text-neutral-400">
              Choose who this product is intended
              for.
            </p>
          </div>

          {/* Occasion */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Occasion
              <span className="ml-1 font-normal text-neutral-400">
                (optional)
              </span>
            </label>

            <select
              value={form.occasion}
              onChange={(event) =>
                updateForm(
                  "occasion",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
            >
              <option value="">
                Select occasion
              </option>

              {OCCASION_OPTIONS.map(
                (occasion) => (
                  <option
                    key={occasion}
                    value={occasion}
                  >
                    {occasion}
                  </option>
                )
              )}
            </select>

            <p className="mt-2 text-xs text-neutral-400">
              Choose the occasion this product is
              suitable for.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                updateForm(
                  "price",
                  event.target.value
                )
              }
              placeholder="49.99"
              required
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Stock
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) =>
                updateForm(
                  "stock",
                  event.target.value
                )
              }
              required
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(event) =>
              updateForm(
                "description",
                event.target.value
              )
            }
            placeholder="Describe the product..."
            rows={4}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            YouTube Video URL{" "}
            <span className="font-normal text-neutral-400">
              (optional)
            </span>
          </label>

          <input
            type="url"
            value={form.youtubeVideo}
            onChange={(event) =>
              updateForm(
                "youtubeVideo",
                event.target.value
              )
            }
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
          />

          <p className="mt-2 text-xs text-neutral-400">
            Add a YouTube watch URL or youtu.be URL.
            The video will be shown on the product
            details page when available.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Materials{" "}
            <span className="font-normal text-neutral-400">
              (optional)
            </span>
          </label>

          <textarea
            value={form.materials}
            onChange={(event) =>
              updateForm(
                "materials",
                event.target.value
              )
            }
            placeholder="e.g. 100% organic cotton, sustainably sourced..."
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Shipping{" "}
            <span className="font-normal text-neutral-400">
              (optional)
            </span>
          </label>

          <textarea
            value={form.shipping}
            onChange={(event) =>
              updateForm(
                "shipping",
                event.target.value
              )
            }
            placeholder="e.g. Ships in 2-3 business days. Free delivery on orders over $50..."
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Returns{" "}
            <span className="font-normal text-neutral-400">
              (optional)
            </span>
          </label>

          <textarea
            value={form.returns}
            onChange={(event) =>
              updateForm(
                "returns",
                event.target.value
              )
            }
            placeholder="e.g. 30-day return policy for unused items in original packaging..."
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-neutral-700">
              Product Images
            </label>

            <span className="text-xs text-neutral-400">
              {form.images.length} selected
            </span>
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={uploadingImages}
            onChange={async (event) => {
              const files = Array.from(
                event.target.files || []
              );

              event.target.value = "";

              if (!files.length) return;

              if (
                files.length +
                  form.images.length >
                10
              ) {
                setError(
                  "You can add up to 10 product images."
                );
                return;
              }

              try {
                setUploadingImages(true);
                clearMessages();

                const body =
                  new FormData();

                files.forEach((file) =>
                  body.append(
                    "files",
                    file
                  )
                );

                const response =
                  await fetch(
                    "/api/admin/products/upload",
                    {
                      method: "POST",
                      body,
                    }
                  );

                const data =
                  await response.json();

                if (!response.ok) {
                  throw new Error(
                    data.error ||
                      "Unable to upload images."
                  );
                }

                setForm(
                  (current) => ({
                    ...current,
                    images: [
                      ...current.images,
                      ...(data.urls || []),
                    ],
                    image:
                      current.image ||
                      data.urls?.[0] ||
                      "",
                  })
                );
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Unable to upload images."
                );
              } finally {
                setUploadingImages(false);
              }
            }}
            className="w-full rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-4 text-sm text-black outline-none transition hover:border-black disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-xs text-neutral-400">
            Upload up to 10 images. The first image
            is used as the main product image. JPG,
            PNG, WEBP or GIF, max 5 MB each.
          </p>

          {form.images.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {form.images.map(
                (url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
                  >
                    <img
                      src={url}
                      alt={`Product image ${
                        index + 1
                      }`}
                      className="aspect-square w-full object-cover"
                    />

                    {index === 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-black px-2 py-1 text-[10px] font-medium text-white">
                        Main
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() =>
                        setForm(
                          (current) => {
                            const next =
                              current.images.filter(
                                (_, imageIndex) =>
                                  imageIndex !==
                                  index
                              );

                            return {
                              ...current,
                              images: next,
                              image:
                                next[0] || "",
                            };
                          }
                        )
                      }
                      className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-1 text-xs font-medium text-black opacity-0 shadow transition group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-xs text-neutral-400">
              No images selected yet.
            </div>
          )}

          {form.images.length === 0 ? (
            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-neutral-500">
                Or use an image URL
              </label>

              <input
                type="url"
                value={form.image}
                onChange={(event) =>
                  updateForm(
                    "image",
                    event.target.value
                  )
                }
                placeholder="https://example.com/product.jpg"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(event) =>
                updateForm(
                  "isNew",
                  event.target.checked
                )
              }
              className="h-4 w-4 accent-black"
            />

            <span className="text-sm font-medium text-neutral-700">
              Mark as New
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateForm(
                  "isActive",
                  event.target.checked
                )
              }
              className="h-4 w-4 accent-black"
            />

            <span className="text-sm font-medium text-neutral-700">
              Active Product
            </span>
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-100 pt-5">
          <button
            type="button"
            onClick={() =>
              isEdit
                ? closeEditForm()
                : (setShowAddForm(false),
                  setForm(emptyForm))
            }
            disabled={isEdit && updating}
            className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              isEdit
                ? updating
                : creating ||
                  categoriesLoading ||
                  categories.length === 0
            }
            className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEdit
              ? updating
                ? "Saving..."
                : "Save Changes"
              : creating
              ? "Creating..."
              : "Create Product"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Lumora Admin
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-black">
              Products
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage your store products and inventory.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                clearMessages();

                setShowAddForm(
                  (current) => !current
                );

                setShowEditForm(false);
              }}
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              {showAddForm
                ? "Close Form"
                : "+ Add Product"}
            </button>

            <Link
              href="/admin"
              className="w-fit rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-100"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {seedMessage ? (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {seedMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {showAddForm ? (
          <section className="mb-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                New Product
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
                Add Product
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Create a new product in your database.
              </p>
            </div>

            {renderProductForm(false)}
          </section>
        ) : null}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Products"
            value={
              loading
                ? "—"
                : products.length
            }
          />

          <StatCard
            label="Active"
            value={
              loading
                ? "—"
                : activeProducts
            }
          />

          <StatCard
            label="Low Stock"
            value={
              loading
                ? "—"
                : lowStockProducts
            }
          />

          <StatCard
            label="Out of Stock"
            value={
              loading
                ? "—"
                : outOfStockProducts
            }
          />
        </div>

        <section className="mb-6 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
                Search
              </label>

              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
                Sort
              </label>

              <select
                value={sortField}
                onChange={(event) =>
                  setSortField(
                    event.target.value as typeof sortField
                  )
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
              >
                <option value="newest">
                  Newest
                </option>

                <option value="nameAsc">
                  Name A-Z
                </option>

                <option value="nameDesc">
                  Name Z-A
                </option>

                <option value="priceAsc">
                  Price Low to High
                </option>

                <option value="priceDesc">
                  Price High to Low
                </option>

                <option value="stockAsc">
                  Stock Low to High
                </option>

                <option value="stockDesc">
                  Stock High to Low
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as typeof statusFilter
                  )
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
              >
                <option value="all">
                  All
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Hidden / Inactive
                </option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              {totalProducts === 0 ? (
                "Showing 0 products"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium text-black">
                    {showingFrom}-{showingTo}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-black">
                    {totalProducts}
                  </span>{" "}
                  products
                </>
              )}
            </p>

            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  disabled={
                    safeCurrentPage === 1
                  }
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {getPageNumbers().map(
                  (page, index) =>
                    page ===
                      "ellipsis-left" ||
                    page ===
                      "ellipsis-right" ? (
                      <span
                        key={`${page}-${index}`}
                        className="px-1.5 text-sm text-neutral-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          setCurrentPage(
                            page
                          )
                        }
                        disabled={
                          page ===
                          safeCurrentPage
                        }
                        className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          page ===
                          safeCurrentPage
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 bg-white text-black hover:bg-neutral-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-black">
              Product Catalog
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Products currently stored in your database.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-neutral-500">
              Loading products...
            </div>
          ) : totalProducts === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-medium text-neutral-700">
                {searchTerm.trim() ||
                statusFilter !== "all"
                  ? "No products match your search or filter"
                  : "No products found"}
              </p>

              <p className="mt-1 text-sm text-neutral-400">
                {searchTerm.trim() ||
                statusFilter !== "all"
                  ? "Try adjusting your search, sort, or filter."
                  : "Your product database is currently empty."}
              </p>

              {searchTerm.trim() === "" &&
              statusFilter === "all" ? (
                <button
                  type="button"
                  onClick={
                    handleSeedProducts
                  }
                  disabled={seeding}
                  className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {seeding
                    ? "Importing..."
                    : "Import Catalog Products"}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {paginatedProducts.map(
                (product) => (
                  <div
                    key={product.id}
                    className="px-5 py-5 transition hover:bg-neutral-50 sm:px-6"
                  >
                    <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[80px_minmax(220px,1fr)_110px_90px_100px_minmax(210px,auto)] xl:items-center xl:gap-6">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={
                              product.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-black">
                            {product.name}
                          </h3>

                          {product.isNew ? (
                            <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                              New
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-sm text-neutral-500">
                          {product.category}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.recipient ? (
                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600">
                              {product.recipient}
                            </span>
                          ) : null}

                          {product.occasion ? (
                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600">
                              {product.occasion}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 line-clamp-1 text-xs text-neutral-400">
                          {product.description ||
                            "No description"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-400">
                          Price
                        </p>

                        <p className="mt-1 font-semibold text-black">
                          {formatCurrency(
                            product.price
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-400">
                          Stock
                        </p>

                        <p
                          className={`mt-1 font-medium ${
                            product.stock <= 0
                              ? "text-red-600"
                              : product.stock <=
                                5
                              ? "text-orange-600"
                              : "text-black"
                          }`}
                        >
                          {product.stock}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-400">
                          Status
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                            product.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {product.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4 xl:border-t-0 xl:border-l xl:pl-5 xl:pt-0">
                        <p className="w-full text-xs font-medium uppercase tracking-wide text-neutral-400 xl:hidden">
                          Actions
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              product
                            )
                          }
                          disabled={
                            updating ||
                            deletingId ===
                              product.id ||
                            togglingId ===
                              product.id
                          }
                          className="rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-black transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleProduct(
                              product
                            )
                          }
                          disabled={
                            togglingId ===
                              product.id ||
                            deletingId ===
                              product.id
                          }
                          className="rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-black transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {togglingId ===
                          product.id
                            ? "Saving..."
                            : product.isActive
                            ? "Hide"
                            : "Show"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProduct(
                              product
                            )
                          }
                          disabled={
                            deletingId ===
                              product.id ||
                            togglingId ===
                              product.id
                          }
                          className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          product.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {showEditForm &&
      editingProduct ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-product-title"
        >
          <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Edit Product
                </p>

                <h2
                  id="edit-product-title"
                  className="mt-2 text-2xl font-semibold tracking-tight text-black"
                >
                  {editingProduct.name}
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Update product details,
                  inventory and visibility.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditForm}
                disabled={updating}
                aria-label="Close edit form"
                className="rounded-xl border border-neutral-200 px-3 py-2 text-lg leading-none text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {renderProductForm(true)}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-black">
        {value}
      </p>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CategoryForm = {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  image: "",
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] =
    useState<CategoryForm>(emptyForm);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/categories",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load categories."
        );
      }

      setCategories(data.categories || []);
    } catch (err) {
      console.error("Load categories error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateForm(
    field: keyof CategoryForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

async function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setSaving(true);
  setError("");
  setSuccess("");

  try {
    const isEditing = Boolean(editingId);

    const url = isEditing
      ? `/api/admin/categories/${editingId}`
      : "/api/admin/categories";

    const method = isEditing
      ? "PATCH"
      : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        image: form.image,
        isActive: form.isActive,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          (isEditing
            ? "Unable to update category."
            : "Unable to create category.")
      );
    }

    if (isEditing) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingId
            ? data.category
            : category
        )
      );

      setSuccess(
        "Category updated successfully."
      );
    } else {
      setCategories((current) => [
        data.category,
        ...current,
      ]);

      setSuccess(
        "Category created successfully."
      );
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  } catch (err) {
    console.error(
      "Save category error:",
      err
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to save category."
    );
  } finally {
    setSaving(false);
  }
}

  async function handleToggle(category: Category) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !category.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update category."
        );
      }

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? {
                ...item,
                isActive: data.category.isActive,
                updatedAt:
                  data.category.updatedAt,
              }
            : item
        )
      );

      setSuccess(
        category.isActive
          ? "Category deactivated."
          : "Category activated."
      );
    } catch (err) {
      console.error(
        "Toggle category error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update category."
      );
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete category."
        );
      }

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id
        )
      );

      setSuccess("Category deleted successfully.");
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category."
      );
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);

    setForm({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  const activeCount = categories.filter(
    (category) => category.isActive
  ).length;

  const inactiveCount =
    categories.length - activeCount;

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredCategories = normalizedSearch
    ? categories.filter((category) =>
        [
          category.name,
          category.slug,
          category.description || "",
        ].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        )
      )
    : categories;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Management
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-black">
              Categories
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Organize your Lumora products into
              clear, manageable categories.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <span className="mr-2 text-base">
              +
            </span>
            Add Category
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
              Total Categories
            </p>

            <p className="mt-2 text-3xl font-semibold text-black">
              {categories.length}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
              Active
            </p>

            <p className="mt-2 text-3xl font-semibold text-black">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-semibold text-black">
              {inactiveCount}
            </p>
          </div>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  {editingId
                    ? "Edit Category"
                    : "Create Category"}
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {editingId
                    ? "Update the category details below."
                    : "Add a new category to your catalog."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-black disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="category-name"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Name
                  </label>

                  <input
                    id="category-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Accessories"
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category-image"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Image URL
                  </label>

                  <input
                    id="category-image"
                    type="url"
                    value={form.image}
                    onChange={(event) =>
                      updateForm(
                        "image",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe this category..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
                />
              </div>

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
                  className="h-4 w-4 rounded border-neutral-300"
                />

                <span className="text-sm font-medium text-neutral-700">
                  Active category
                </span>
              </label>

              <div className="flex justify-end gap-3 border-t border-neutral-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-black">
                  All Categories
                </h2>

                <p className="mt-1 text-xs text-neutral-400">
                  Manage your product categories.
                </p>
              </div>

              <div className="w-full sm:max-w-xs">
                <label
                  htmlFor="category-search"
                  className="sr-only"
                >
                  Search categories
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                    ⌕
                  </span>

                  <input
                    id="category-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search categories..."
                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-9 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear category search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-black" />

              <p className="text-sm text-neutral-500">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-xl text-neutral-400">
                ◇
              </div>

              <h3 className="mt-5 text-base font-semibold text-black">
                No categories yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Create your first category to start
                organizing the Lumora catalog.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Create First Category
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-lg text-neutral-400">
                ⌕
              </div>

              <h3 className="mt-4 text-base font-semibold text-black">
                No categories found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                No category matches “{searchQuery}”. Try a different name, slug, or description.
              </p>

              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-5 px-6 py-5 transition hover:bg-neutral-50 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg text-neutral-400">
                          ◇
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-black">
                          {category.name}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                            category.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {category.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-neutral-400">
                        /{category.slug}
                      </p>

                      {category.description && (
                        <p className="mt-2 line-clamp-1 max-w-xl text-sm text-neutral-500">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(category)
                      }
                      className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggle(category)
                      }
                      className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                    >
                      {category.isActive
                        ? "Disable"
                        : "Enable"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(category)
                      }
                      className="rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

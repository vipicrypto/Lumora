"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating";

interface SearchProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  recipient?: string | null;
  occasion?: string | null;
}

type SearchCategory = {
  name: string;
  slug: string;
};

type HomeSectionItem = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  isActive?: boolean;
  sortOrder?: number | null;
};

function SearchContent() {
  const searchParams = useSearchParams();

  const query = searchParams.get("q")?.trim() || "";
  const categoryFromUrl =
    searchParams.get("category")?.trim() || "";
  const recipientFromUrl =
    searchParams.get("recipient")?.trim() || "";
  const occasionFromUrl =
    searchParams.get("occasion")?.trim() || "";

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedRecipient, setSelectedRecipient] =
    useState("All");

  const [selectedOccasion, setSelectedOccasion] =
    useState("All");

  const [sortBy, setSortBy] =
    useState<SortOption>("featured");

  const [products, setProducts] =
    useState<SearchProduct[]>([]);

  const [categories, setCategories] =
    useState<SearchCategory[]>([]);

  const [recipientOptions, setRecipientOptions] =
    useState<HomeSectionItem[]>([]);

  const [occasionOptions, setOccasionOptions] =
    useState<HomeSectionItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /*
   * Load products from the live database-backed public API.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        setLoadError("");

        const response = await fetch(
          "/api/products?limit=24",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        if (cancelled) return;

        const items: SearchProduct[] =
          Array.isArray(data?.products)
            ? data.products.map(
                (product: SearchProduct) => ({
                  id: product.id,
                  name: product.name,
                  description:
                    product.description ?? "",
                  price:
                    Number(product.price) || 0,
                  category: product.category,
                  image: product.image || "",
                  images: Array.isArray(product.images)
                    ? product.images
                    : [],
                  rating:
                    typeof product.rating === "number"
                      ? product.rating
                      : 0,
                  reviewCount:
                    typeof product.reviewCount ===
                    "number"
                      ? product.reviewCount
                      : 0,
                  recipient:
                    product.recipient ?? null,
                  occasion:
                    product.occasion ?? null,
                })
              )
            : [];

        setProducts(items);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Search catalog load error:",
          error
        );

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load products."
        );

        setProducts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load only active categories from the database.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch(
          "/api/categories",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (cancelled) return;

        const items: SearchCategory[] =
          Array.isArray(data?.categories)
            ? data.categories
                .map(
                  (category: {
                    name?: string;
                    slug?: string;
                  }) => ({
                    name:
                      category.name?.trim() || "",
                    slug:
                      category.slug?.trim() || "",
                  })
                )
                .filter(
                  (category: SearchCategory) =>
                    category.name.length > 0 &&
                    category.slug.length > 0
                )
            : [];

        setCategories(items);

        if (categoryFromUrl) {
          const matchedCategory = items.find(
            (category) =>
              category.slug.toLowerCase() ===
              categoryFromUrl.toLowerCase()
          );

          setSelectedCategory(
            matchedCategory?.name || "All"
          );
        } else {
          setSelectedCategory("All");
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [categoryFromUrl]);

  /*
   * Load active recipients and occasions from
   * the database-backed public home sections API.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadHomeSections() {
      try {
        const response = await fetch(
          "/api/home-sections",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load recipient and occasion filters."
          );
        }

        const data = await response.json();

        if (cancelled) return;

        const normalizeItems = (
          value: unknown
        ): HomeSectionItem[] => {
          if (!Array.isArray(value)) {
            return [];
          }

          return value
            .map((item: HomeSectionItem) => ({
              id: item.id,
              name:
                typeof item.name === "string"
                  ? item.name.trim()
                  : "",
              slug:
                typeof item.slug === "string"
                  ? item.slug.trim()
                  : null,
              description:
                typeof item.description ===
                "string"
                  ? item.description
                  : null,
              image:
                typeof item.image === "string"
                  ? item.image
                  : null,
              isActive:
                typeof item.isActive ===
                "boolean"
                  ? item.isActive
                  : true,
              sortOrder:
                typeof item.sortOrder ===
                "number"
                  ? item.sortOrder
                  : 0,
            }))
            .filter(
              (item) =>
                item.id &&
                item.name &&
                item.isActive !== false
            )
            .sort(
              (a, b) =>
                (a.sortOrder ?? 0) -
                (b.sortOrder ?? 0)
            );
        };

        /*
         * Support the current API structure:
         *
         * {
         *   sections: {
         *     recipient: { items: [...] },
         *     occasion: { items: [...] }
         *   }
         * }
         */
        const recipients =
          normalizeItems(
            data?.sections?.recipient?.items
          );

        const occasions =
          normalizeItems(
            data?.sections?.occasion?.items
          );

        setRecipientOptions(recipients);
        setOccasionOptions(occasions);

        /*
         * Match recipient URL against the live DB
         * values, case-insensitively.
         */
        if (recipientFromUrl) {
          const matchedRecipient =
            recipients.find(
              (recipient) =>
                recipient.name.toLowerCase() ===
                  recipientFromUrl.toLowerCase() ||
                recipient.slug?.toLowerCase() ===
                  recipientFromUrl.toLowerCase()
            );

          setSelectedRecipient(
            matchedRecipient?.name ||
              recipientFromUrl
          );
        } else {
          setSelectedRecipient("All");
        }

        /*
         * Match occasion URL against the live DB
         * values, case-insensitively.
         */
        if (occasionFromUrl) {
          const matchedOccasion =
            occasions.find(
              (occasion) =>
                occasion.name.toLowerCase() ===
                  occasionFromUrl.toLowerCase() ||
                occasion.slug?.toLowerCase() ===
                  occasionFromUrl.toLowerCase()
            );

          setSelectedOccasion(
            matchedOccasion?.name ||
              occasionFromUrl
          );
        } else {
          setSelectedOccasion("All");
        }
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Home sections load error:",
          error
        );

        setRecipientOptions([]);
        setOccasionOptions([]);

        /*
         * Preserve direct URL filters even if the
         * options endpoint temporarily fails.
         */
        setSelectedRecipient(
          recipientFromUrl || "All"
        );

        setSelectedOccasion(
          occasionFromUrl || "All"
        );
      }
    }

    loadHomeSections();

    return () => {
      cancelled = true;
    };
  }, [
    recipientFromUrl,
    occasionFromUrl,
  ]);

  /*
   * Filter products by:
   * - Search query
   * - Database category
   * - Database recipient
   * - Database occasion
   */
  const results = useMemo(() => {
    const normalizedQuery =
      query.toLowerCase();

    const filtered = products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description,
        product.recipient,
        product.occasion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedQuery ||
        searchableText.includes(
          normalizedQuery
        );

      const matchesCategory =
        selectedCategory === "All" ||
        product.category.toLowerCase() ===
          selectedCategory.toLowerCase();

      const matchesRecipient =
        selectedRecipient === "All" ||
        product.recipient?.toLowerCase() ===
          selectedRecipient.toLowerCase();

      const matchesOccasion =
        selectedOccasion === "All" ||
        product.occasion?.toLowerCase() ===
          selectedOccasion.toLowerCase();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesRecipient &&
        matchesOccasion
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;

        case "price-high":
          return b.price - a.price;

        case "rating":
          return (
            (b.rating ?? 0) -
            (a.rating ?? 0)
          );

        case "featured":
        default:
          return 0;
      }
    });
  }, [
    products,
    query,
    selectedCategory,
    selectedRecipient,
    selectedOccasion,
    sortBy,
  ]);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedRecipient("All");
    setSelectedOccasion("All");
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedRecipient !== "All" ||
    selectedOccasion !== "All" ||
    sortBy !== "featured";

  const pageTitle = query
    ? `Results for “${query}”`
    : selectedRecipient !== "All"
    ? selectedRecipient
    : selectedOccasion !== "All"
    ? selectedOccasion
    : selectedCategory !== "All"
    ? selectedCategory
    : "Search Products";

  return (
    <main className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8 md:mb-10">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[#8b6f5a]">
          Search
        </p>

        <h1 className="font-serif text-3xl font-semibold text-[#2d2a26] md:text-4xl lg:text-5xl">
          {pageTitle}
        </h1>

        <p className="mt-3 text-sm text-[#6b6258]">
          {loading
            ? "Searching products…"
            : loadError
            ? loadError
            : `${results.length} ${
                results.length === 1
                  ? "product"
                  : "products"
              } found`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-stone-100 bg-white p-4 sm:p-5">
        {/* Categories */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
            Categories
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedCategory("All")
              }
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                selectedCategory === "All"
                  ? "bg-[#2d2a26] text-white"
                  : "border border-stone-200 bg-white text-[#5a5248] hover:bg-stone-50"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category.name
                  )
                }
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  selectedCategory ===
                  category.name
                    ? "bg-[#2d2a26] text-white"
                    : "border border-stone-200 bg-white text-[#5a5248] hover:bg-stone-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
            Shop For
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedRecipient("All")
              }
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                selectedRecipient === "All"
                  ? "bg-[#2d2a26] text-white"
                  : "border border-stone-200 bg-white text-[#5a5248] hover:bg-stone-50"
              }`}
            >
              Everyone
            </button>

            {recipientOptions.map(
              (recipient) => (
                <button
                  key={recipient.id}
                  type="button"
                  onClick={() =>
                    setSelectedRecipient(
                      recipient.name
                    )
                  }
                  className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    selectedRecipient ===
                    recipient.name
                      ? "bg-[#2d2a26] text-white"
                      : "border border-stone-200 bg-white text-[#5a5248] hover:bg-stone-50"
                  }`}
                >
                  {recipient.name}
                </button>
              )
            )}
          </div>
        </div>

        {/* Occasion */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
            Occasion
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedOccasion("All")
              }
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                selectedOccasion === "All"
                  ? "bg-[#2d2a26] text-white"
                  : "border border-stone-200 bg-white text-[#5a5248] hover:bg-stone-50"
              }`}
            >
              All Occasions
            </button>

            {occasionOptions.map(
              (occasion) => (
                <button
                  key={occasion.id}
                  type="button"
                  onClick={() =>
                    setSelectedOccasion(
                      occasion.name
                    )
                  }
                  className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    selectedOccasion ===
                    occasion.name
                      ? "bg-[#2d2a26] text-white"
                      : "border border-stone-200 bg-white text-[#5a5248] hover:bg-stone-50"
                  }`}
                >
                  {occasion.name}
                </button>
              )
            )}
          </div>
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-4 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-3">
            <label
              htmlFor="sort"
              className="text-xs font-medium text-stone-500"
            >
              Sort
            </label>

            <select
              id="sort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as SortOption
                )
              }
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-[#2d2a26] outline-none"
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="rating">
                Highest Rated
              </option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#8b6f5a] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Summary */}
      {(selectedRecipient !== "All" ||
        selectedOccasion !== "All") && (
        <div className="mb-6 flex flex-wrap gap-2">
          {selectedRecipient !== "All" && (
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-[#5a5248]">
              For: {selectedRecipient}
            </span>
          )}

          {selectedOccasion !== "All" && (
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-[#5a5248]">
              Occasion: {selectedOccasion}
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {!loading &&
      !loadError &&
      results.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                images: product.images,
                category: product.category,
                rating: product.rating ?? 0,
                reviewCount:
                  product.reviewCount ?? 0,
                description:
                  product.description,
              }}
            />
          ))}
        </div>
      ) : !loading && !loadError ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-stone-100 bg-white px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b6f5a]/10">
            <svg
              className="h-7 w-7 text-[#8b6f5a]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>

          <h2 className="font-serif text-2xl font-semibold text-[#2d2a26]">
            No products found
          </h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-500">
            We couldn&apos;t find anything
            matching your search. Try another
            keyword or clear the filters.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-[#2d2a26] transition hover:bg-stone-50"
              >
                Clear Filters
              </button>
            )}

            <Link
              href="/"
              className="rounded-full bg-[#2d2a26] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}

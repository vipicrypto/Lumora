"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(products.map((product) => product.category))
      ),
    ];
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    const filtered = products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description,
        product.materials,
        product.shipping,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;

        case "price-high":
          return b.price - a.price;

        case "rating":
          return b.rating - a.rating;

        case "featured":
        default:
          return 0;
      }
    });
  }, [query, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory !== "All" || sortBy !== "featured";

  return (
    <main className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8 md:mb-10">
        <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#8b6f5a] mb-2">
          Search
        </p>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-[#2d2a26]">
          {query ? `Results for “${query}”` : "Search Products"}
        </h1>

        <p className="mt-3 text-sm text-[#6b6258]">
          {results.length}{" "}
          {results.length === 1 ? "product" : "products"} found
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-stone-100 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-[#2d2a26] text-white"
                    : "border border-stone-200 bg-white text-[#5a5248] hover:bg-stone-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

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
                setSortBy(event.target.value as SortOption)
              }
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-[#2d2a26] outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
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

      {/* Results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
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

          <h2 className="text-2xl font-serif font-semibold text-[#2d2a26]">
            No products found
          </h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-500">
            We couldn&apos;t find anything matching your search.
            Try another keyword or clear the filters.
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
      )}
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
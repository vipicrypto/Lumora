"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/data/products";
import { adaptDatabaseProductList } from "@/lib/products";

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          "/api/products?section=new&limit=100",
          { cache: "no-store" }
        );

        const data = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (response.ok && Array.isArray(data.products)) {
          setProducts(adaptDatabaseProductList(data.products));
        } else {
          setProducts([]);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-[#eee9e4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#8b6f5a] hover:text-[#2d2a26] transition-colors mb-8"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to home
            </Link>

            <span className="block text-xs font-semibold tracking-[0.18em] uppercase text-[#8b6f5a] mb-3">
              Fresh arrivals
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-[#2d2a26] leading-[1.05]">
              New Arrivals
            </h1>

            <p className="mt-5 text-base md:text-lg text-[#6f6963] leading-7 max-w-2xl">
              Discover what&apos;s new at Lumora — fresh finds and thoughtful
              gifts just added to the collection.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl overflow-hidden"
              >
                <div className="aspect-square bg-[#f3f0ed]" />

                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#f3f0ed] rounded w-3/4" />
                  <div className="h-4 bg-[#f3f0ed] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-7">
              <p className="text-sm text-[#77716b]">
                {products.length}{" "}
                {products.length === 1 ? "new arrival" : "new arrivals"}{" "}
                to discover
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-serif font-semibold text-[#2d2a26]">
              No new arrivals yet
            </h2>

            <p className="mt-3 text-[#77716b]">
              Check back soon for something new.
            </p>

            <Link
              href="/gifts"
              className="inline-flex items-center gap-2 mt-7 px-5 py-3 rounded-full bg-[#2d2a26] text-white text-sm font-medium hover:bg-[#45403b] transition-colors"
            >
              Explore all gifts
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
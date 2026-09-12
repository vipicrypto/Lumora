import { NextResponse } from "next/server";

import { db } from "@/prisma/db";

/**
 * Customer-facing product listing.
 *
 * Returns lightweight product summaries suitable for the homepage and
 * listing pages. The full catalog is filtered to active products and
 * projected down to the fields the storefront needs.
 */

function getProductImages(
  value: string | null | undefined
): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string =>
          typeof item === "string" &&
          item.trim().length > 0
      );
    }
  } catch {
    // Legacy products store a single URL as plain text.
  }

  return value.trim() ? [value.trim()] : [];
}

function getPrimaryImage(
  value: string | null | undefined
): string {
  return getProductImages(value)[0] || "";
}

function parseCollection(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is string =>
          typeof item === "string"
      )
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const section = (
      url.searchParams.get("section") || ""
    ).toLowerCase();

    const limitParam = Number(
      url.searchParams.get("limit")
    );

    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(24, Math.floor(limitParam))
        : 8;

    const categoryFilter = parseCollection(
      url.searchParams.getAll("category")
    );

    const recipientFilter = parseCollection(
      url.searchParams.getAll("recipient")
    );

    const occasionFilter = parseCollection(
      url.searchParams.getAll("occasion")
    );

    const searchTerm = (
      url.searchParams.get("q") || ""
    )
      .trim()
      .toLowerCase();

    const products = await db.orm.public.Product.all();

    const active = products.filter(
      (product) => product.isActive
    );

    let filtered = active;

    /*
     * Category filter
     */
    if (categoryFilter.length > 0) {
      const lowered = categoryFilter.map((value) =>
        value.toLowerCase()
      );

      filtered = filtered.filter((product) => {
        const productCategory = String(
          product.category || ""
        ).toLowerCase();

        return lowered.some(
          (needle) =>
            productCategory === needle
        );
      });
    }

    /*
     * Recipient filter
     *
     * Example:
     * /api/products?recipient=For%20Her
     */
    if (recipientFilter.length > 0) {
      const lowered = recipientFilter.map((value) =>
        value.toLowerCase()
      );

      filtered = filtered.filter((product) => {
        const productRecipient = String(
          product.recipient || ""
        ).toLowerCase();

        return lowered.some(
          (needle) =>
            productRecipient === needle
        );
      });
    }

    /*
     * Occasion filter
     *
     * Example:
     * /api/products?occasion=Birthday
     */
    if (occasionFilter.length > 0) {
      const lowered = occasionFilter.map((value) =>
        value.toLowerCase()
      );

      filtered = filtered.filter((product) => {
        const productOccasion = String(
          product.occasion || ""
        ).toLowerCase();

        return lowered.some(
          (needle) =>
            productOccasion === needle
        );
      });
    }

    /*
     * Search
     *
     * Search now includes:
     * - Product name
     * - Description
     * - Category
     * - Recipient
     * - Occasion
     */
    if (searchTerm.length > 0) {
      filtered = filtered.filter((product) => {
        const haystack = [
          product.name,
          product.description,
          product.category,
          product.recipient,
          product.occasion,
        ]
          .map((value) =>
            String(value || "").toLowerCase()
          )
          .join(" ");

        return haystack.includes(searchTerm);
      });
    }

    /*
     * New products
     */
    if (section === "new") {
      filtered = filtered.filter(
        (product) => product.isNew
      );
    }

    let ordered: typeof filtered = filtered;

    /*
     * Best sellers
     */
    if (section === "best") {
      ordered = [...filtered].sort((a, b) => {
        const stockDifference =
          Number(b.stock || 0) -
          Number(a.stock || 0);

        if (stockDifference !== 0) {
          return stockDifference;
        }

        return String(a.name).localeCompare(
          String(b.name)
        );
      });
    }

    /*
     * Featured products
     */
    else if (section === "featured") {
      ordered = [...filtered].sort((a, b) => {
        const aFeatured = a.isNew ? 0 : 1;
        const bFeatured = b.isNew ? 0 : 1;

        if (aFeatured !== bFeatured) {
          return aFeatured - bFeatured;
        }

        return String(a.name).localeCompare(
          String(b.name)
        );
      });
    }

    /*
     * New products
     */
    else if (section === "new") {
      ordered = [...filtered].sort((a, b) => {
        return String(a.name).localeCompare(
          String(b.name)
        );
      });
    }

    /*
     * Default ordering
     */
    else {
      ordered = [...filtered].sort((a, b) => {
        return String(a.name).localeCompare(
          String(b.name)
        );
      });
    }

    const sliced = ordered.slice(0, limit);

    /*
     * Load reviews for rating information.
     */
    const allReviews =
      await db.orm.public.Review.all();

    const ratingByProduct = new Map<
      string,
      {
        sum: number;
        count: number;
      }
    >();

    for (const review of allReviews) {
      const productId = String(
        review.productId
      );

      const entry =
        ratingByProduct.get(productId) ?? {
          sum: 0,
          count: 0,
        };

      entry.sum += Number(review.rating);
      entry.count += 1;

      ratingByProduct.set(
        productId,
        entry
      );
    }

    return NextResponse.json({
      success: true,

      products: sliced.map((product) => {
        const stats =
          ratingByProduct.get(
            String(product.id)
          );

        const reviewCount =
          stats?.count ?? 0;

        const averageRating =
          reviewCount > 0
            ? Math.round(
                (stats!.sum /
                  reviewCount) *
                  10
              ) / 10
            : 0;

        return {
          id: product.id,
          name: product.name,
          description: product.description,

          price: Number(product.price),

          category: product.category,
          categoryId:
            product.categoryId ?? null,

          /*
           * New public filtering fields
           */
          recipient:
            product.recipient ?? null,

          occasion:
            product.occasion ?? null,

          image: getPrimaryImage(
            product.image
          ),

          images: getProductImages(
            product.image
          ),

          isNew: product.isNew,
          isActive: product.isActive,

          stock: Number(
            product.stock || 0
          ),

          rating: averageRating,
          reviewCount,
        };
      }),
    });
  } catch (error) {
    console.error(
      "Public products GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

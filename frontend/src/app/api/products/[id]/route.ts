import { NextResponse } from "next/server";

import { db } from "@/prisma/db";

/**
 * Customer-facing product detail endpoint.
 *
 * Returns a single active product, expanded for the storefront:
 * - normalized image gallery
 * - normalized YouTube embed URL (when present)
 * - a small set of related products in the same category
 */

function getProductImages(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      );
    }
  } catch {
    // Legacy products store a single URL as plain text.
  }
  return value.trim() ? [value.trim()] : [];
}

function getPrimaryImage(value: string | null | undefined): string {
  return getProductImages(value)[0] || "";
}

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : value;
    }

    if (url.hostname.includes("youtube.com")) {
      const watchId = url.searchParams.get("v");
      if (watchId) return `https://www.youtube.com/embed/${watchId}`;
      const embedMatch = url.pathname.match(/^\/embed\/([^/]+)/);
      if (embedMatch?.[1]) {
        return `https://www.youtube.com/embed/${embedMatch[1]}`;
      }
    }
  } catch {
    // The admin API validates saved URLs.
  }
  return value;
}

function formatProduct(
  product: {
    id: string;
    name: string;
    description: string;
    price: unknown;
    category: string;
    image: string | null;
    isNew: boolean;
    isActive: boolean;
    stock: number | null;
    youtubeVideo: string | null;
    materials: string | null;
    shipping: string | null;
    returns: string | null;
  },
  rating: number,
  reviewCount: number
) {
  const images = getProductImages(product.image);
  const primaryImage = images[0] || "";

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    category: product.category,
    image: primaryImage,
    images,
    isNew: product.isNew,
    isActive: product.isActive,
    stock: Number(product.stock || 0),
    rating,
    reviewCount,
    youtubeVideo: product.youtubeVideo ?? null,
    youtubeEmbedUrl: product.youtubeVideo
      ? getYouTubeEmbedUrl(product.youtubeVideo)
      : null,
    materials: product.materials ?? null,
    shipping: product.shipping ?? null,
    returns: product.returns ?? null,
  };
}

function computeRatingStats(
  reviews: { productId: string; rating: number | string }[]
): Map<string, { sum: number; count: number }> {
  const stats = new Map<string, { sum: number; count: number }>();
  for (const review of reviews) {
    const productId = String(review.productId);
    const entry = stats.get(productId) ?? { sum: 0, count: 0 };
    entry.sum += Number(review.rating);
    entry.count += 1;
    stats.set(productId, entry);
  }
  return stats;
}

function resolveRating(
  stats: Map<string, { sum: number; count: number }>,
  productId: string
): { rating: number; reviewCount: number } {
  const entry = stats.get(String(productId));
  const reviewCount = entry?.count ?? 0;
  const rating =
    reviewCount > 0
      ? Math.round((entry!.sum / reviewCount) * 10) / 10
      : 0;
  return { rating, reviewCount };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const product = await db.orm.public.Product
      .where({ id })
      .first();

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const allProducts = await db.orm.public.Product.all();

    const sameCategory = allProducts.filter(
      (candidate) =>
        candidate.isActive &&
        candidate.id !== product.id &&
        candidate.category === product.category
    );

    let related = sameCategory.slice(0, 4);

    if (related.length < 4) {
      const others = allProducts.filter(
        (candidate) =>
          candidate.isActive &&
          candidate.id !== product.id &&
          candidate.category !== product.category
      );
      related = [...related, ...others].slice(0, 4);
    }

    const allReviews = await db.orm.public.Review.all();
    const stats = computeRatingStats(allReviews);

    const mainRating = resolveRating(stats, product.id);
    const relatedRatings = related.map((candidate) =>
      resolveRating(stats, candidate.id)
    );

    return NextResponse.json({
      success: true,
      product: formatProduct(
        product,
        mainRating.rating,
        mainRating.reviewCount
      ),
      related: related.map((candidate, index) => {
        const r = relatedRatings[index]!;
        return formatProduct(candidate, r.rating, r.reviewCount);
      }),
    });
  } catch (error) {
    console.error("Public product detail GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

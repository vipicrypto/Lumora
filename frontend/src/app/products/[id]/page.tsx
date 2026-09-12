import { notFound } from "next/navigation";
import { db } from "@/prisma/db";
import { adaptDatabaseProductList } from "@/lib/products";
import ProductDetails from "./ProductDetails";
import Reviews from "./Reviews";

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

function getYouTubeEmbedUrl(value: string | null | undefined) {
  if (!value) return null;
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
    // ignore invalid URLs
  }
  return value;
}

export async function generateStaticParams() {
  try {
    const products = await db.orm.public.Product.all();
    return products
      .filter((p) => p.isActive)
      .map((p) => ({ id: p.id }));
  } catch {
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await db.orm.public.Product
    .where({ id })
    .first();

  if (!product || !product.isActive) {
    notFound();
  }

  const allProducts = await db.orm.public.Product.all();

  const sameCategory = allProducts.filter(
    (candidate) =>
      candidate.isActive &&
      candidate.id !== product.id &&
      candidate.category === product.category
  );

  let relatedDb = sameCategory.slice(0, 4);

  if (relatedDb.length < 4) {
    const others = allProducts.filter(
      (candidate) =>
        candidate.isActive &&
        candidate.id !== product.id &&
        candidate.category !== product.category
    );
    relatedDb = [...relatedDb, ...others].slice(0, 4);
  }

  const images = getProductImages(product.image);
  const primaryImage = images[0] || "";

  const allReviews = await db.orm.public.Review.all();
  const reviewsForProduct = allReviews.filter(
    (review) => review.productId === product.id
  );
  const reviewCount = reviewsForProduct.length;
  const averageRating =
    reviewCount > 0
      ? reviewsForProduct.reduce(
          (sum, review) => sum + Number(review.rating),
          0
        ) / reviewCount
      : 0;

  const adaptedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    category: product.category,
    categoryId: product.categoryId ?? null,
    image: primaryImage,
    images,
    isNew: product.isNew,
    isActive: product.isActive,
    stock: Number(product.stock || 0),
    rating: Math.round(averageRating * 10) / 10,
    reviewCount,
    youtubeVideo: product.youtubeVideo ?? null,
    youtubeEmbedUrl: getYouTubeEmbedUrl(product.youtubeVideo),
    materials: product.materials ?? undefined,
    shipping: product.shipping ?? undefined,
    returns: product.returns ?? undefined,
  };

  function ratingFor(productId: string): {
    rating: number;
    reviewCount: number;
  } {
    const reviews = allReviews.filter(
      (review) => review.productId === productId
    );
    const count = reviews.length;
    if (count === 0) return { rating: 0, reviewCount: 0 };
    const sum = reviews.reduce(
      (acc, review) => acc + Number(review.rating),
      0
    );
    return {
      rating: Math.round((sum / count) * 10) / 10,
      reviewCount: count,
    };
  }

  const related = adaptDatabaseProductList(
    relatedDb.map((candidate) => {
      const stats = ratingFor(candidate.id);
      return {
        id: candidate.id,
        name: candidate.name,
        description: candidate.description,
        price: Number(candidate.price),
        category: candidate.category,
        categoryId: candidate.categoryId ?? null,
        image: getProductImages(candidate.image)[0] || "",
        images: getProductImages(candidate.image),
        isNew: candidate.isNew,
        isActive: candidate.isActive,
        stock: Number(candidate.stock || 0),
        rating: stats.rating,
        reviewCount: stats.reviewCount,
      };
    })
  );

  return (
    <ProductDetails
      product={adaptedProduct}
      related={related}
    />
  );
}
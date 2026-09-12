/**
 * Shared helper used by the homepage and the product detail page to
 * adapt database-shaped products to the legacy `Product` shape that the
 * UI components (ProductCard, ProductDetails) understand.
 *
 * Keeps the static demo data source intact for other pages that still
 * depend on it (search, etc.).
 */

import type { Product } from "@/data/products";

export interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string | null;
  image: string;
  images?: string[];
  isNew: boolean;
  isActive: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  materials?: string | null;
  shipping?: string | null;
  returns?: string | null;
}

const DEFAULT_RATING = 0;
const DEFAULT_REVIEW_COUNT = 0;
const DEFAULT_SHIPPING =
  "Free standard shipping on orders over $50. Standard delivery arrives in 5–7 business days. Express shipping (2–3 business days) is available at checkout.";
const DEFAULT_RETURNS =
  "Not in love? Return any item within 30 days for a full refund. Items must be unused and in their original packaging. We cover the return label.";

export function adaptDatabaseProduct(
  product: DatabaseProduct
): Product {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  return {
    id: product.id,
    name: product.name,
    price: Number(product.price) || 0,
    image: product.image || (images[0] ?? ""),
    category: product.category,
    rating:
      typeof product.rating === "number"
        ? product.rating
        : DEFAULT_RATING,
    reviewCount:
      typeof product.reviewCount === "number"
        ? product.reviewCount
        : DEFAULT_REVIEW_COUNT,
    description: product.description,
    images,
    isNew: Boolean(product.isNew),
    materials: product.materials ?? DEFAULT_RETURNS,
    shipping: product.shipping ?? DEFAULT_SHIPPING,
    returns: product.returns ?? DEFAULT_RETURNS,
  };
}

export function adaptDatabaseProductList(
  products: DatabaseProduct[]
): Product[] {
  return products.map(adaptDatabaseProduct);
}


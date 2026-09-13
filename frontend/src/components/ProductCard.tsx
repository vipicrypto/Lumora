"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [showMessage, setShowMessage] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const handleWishlistClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product);

    setShowMessage(true);

    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const primaryImage = images[0] || "";

  const rating = Number(product.rating) || 0;
  const price = Number(product.price) || 0;
  const originalPrice =
    typeof product.originalPrice === "number" &&
    product.originalPrice > 0
      ? product.originalPrice
      : undefined;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:border-stone-200 transition-all duration-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-50">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {images.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/55 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm">
            1 / {images.length}
          </span>
        )}

        {product.isNew && (
          <span className="absolute top-3 left-3 bg-[#2d2a26] text-white text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full">
            New
          </span>
        )}

        {originalPrice && (
          <span className="absolute bottom-3 right-3 bg-[#8b6f5a] text-white text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full">
            {Math.round(
              (1 - price / originalPrice) * 100
            )}
            % off
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute bottom-3 right-3 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 ${
            wishlisted
              ? "bg-red-50 text-red-500 opacity-100 translate-y-0"
              : "bg-white/90 text-stone-400 hover:text-red-500"
          }`}
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={wishlisted}
        >
          <svg
            className="w-4 h-4"
            fill={wishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
        </button>

        {/* Wishlist Notification */}
        {showMessage && (
          <div
            className="absolute bottom-3 left-3 right-14 bg-[#2d2a26]/95 text-white text-[11px] font-medium px-3 py-2 rounded-full text-center shadow-lg"
            role="status"
          >
            {wishlisted
              ? "Added to wishlist"
              : "Removed from wishlist"}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#8b6f5a] mb-1">
          {product.category}
        </p>

        <h3 className="font-medium text-[#2d2a26] leading-snug mb-2 line-clamp-2 group-hover:text-[#8b6f5a] transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(rating)
                    ? "text-amber-400"
                    : "text-stone-200"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <span className="text-[11px] text-stone-400">
            {rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#2d2a26]">
₹{price.toFixed(2)}          </span>

          {originalPrice && (
            <span className="text-sm text-stone-400 line-through">
₹{originalPrice.toFixed(2)}            </span>
          )}
        </div>

        <span className="w-full mt-3 py-2.5 bg-[#2d2a26] text-white text-xs font-semibold rounded-full hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Add to Cart
        </span>
      </div>
    </Link>
  );
};

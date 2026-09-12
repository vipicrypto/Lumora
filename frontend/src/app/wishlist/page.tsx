"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const [cartMessage, setCartMessage] = useState("");

  const handleAddToCart = (
    product: (typeof wishlistItems)[number]
  ) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);

    setCartMessage(`${product.name} added to your cart.`);

    window.setTimeout(() => {
      setCartMessage("");
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#faf9f7] relative">
      {/* Cart Notification */}
      {cartMessage && (
        <div className="fixed top-24 right-4 z-[100] max-w-sm animate-in fade-in slide-in-from-right-3 duration-300">
          <div className="flex items-center gap-3 bg-[#2d2a26] text-white px-5 py-3.5 rounded-xl shadow-xl">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <p className="text-sm font-medium">
              {cartMessage}
            </p>
          </div>
        </div>
      )}

      {/* Empty Wishlist */}
      {wishlistItems.length === 0 ? (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-stone-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                />
              </svg>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#2d2a26] mb-3">
              Your Wishlist is Empty
            </h1>

            <p className="text-[#5a5248] leading-relaxed mb-8">
              Save the pieces you love and come back to them whenever
              you&apos;re ready.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[#2d2a26] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md"
            >
              Discover Products
            </Link>
          </div>
        </div>
      ) : (
        /* Wishlist Content */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Header */}
          <div className="mb-10">
            <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#8b6f5a] mb-2">
              Saved For Later
            </p>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-[#2d2a26]">
                  My Wishlist
                </h1>

                <p className="mt-2 text-sm text-stone-500">
                  {wishlistItems.length}{" "}
                  {wishlistItems.length === 1 ? "item" : "items"} saved
                </p>
              </div>

              <button
                type="button"
                onClick={clearWishlist}
                className="self-start sm:self-auto text-sm font-medium text-stone-500 hover:text-red-600 transition-colors"
              >
                Clear Wishlist
              </button>
            </div>
          </div>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <article
                key={product.id}
                className="group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                  <Link
                    href={`/products/${product.id}`}
                    className="block absolute inset-0"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </Link>

                  {/* Remove Wishlist */}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-red-500 shadow-sm hover:bg-white hover:scale-105 transition-all"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  {/* Discount */}
                  {product.originalPrice && (
                    <span className="absolute top-3 left-3 text-[10px] font-semibold text-[#8b6f5a] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                      {Math.round(
                        (1 - product.price / product.originalPrice) * 100
                      )}
                      % off
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <Link
                    href={`/products/${product.id}`}
                    className="block"
                  >
                    <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#8b6f5a] mb-1">
                      {product.category}
                    </p>

                    <h2 className="text-lg font-serif font-semibold text-[#2d2a26] hover:text-[#8b6f5a] transition-colors line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h2>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-lg font-semibold text-[#2d2a26]">
                      ${product.price.toFixed(2)}
                    </span>

                    {product.originalPrice && (
                      <span className="text-sm text-stone-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Add To Cart */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-5 bg-[#2d2a26] text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
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
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>

                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Reviews from "./Reviews";


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
      if (embedMatch?.[1]) return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }
  } catch {
    // The admin API validates saved URLs.
  }
  return value;
}

interface ProductDetailsProps {
  product: Product & {
    youtubeVideo?: string | null;
    youtubeEmbedUrl?: string | null;
  };
  related: Product[];
}

export default function ProductDetails({
  product,
  related,
}: ProductDetailsProps) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const images =
    product.images && product.images.length > 0
      ? product.images.filter(
          (img) => typeof img === "string" && img.length > 0
        )
      : product.image
      ? [product.image]
      : [];

  const [selectedImage, setSelectedImage] = useState(
    images[0] ?? ""
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
const [wishlistMessage, setWishlistMessage] = useState("");
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setCartMessage("Please select a size.");
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setCartMessage("Please select a color.");
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);

    setCartMessage("Added to cart!");
    setTimeout(() => setCartMessage(""), 2500);
  };

  // Buy Now mirrors Add to Cart's size/color validation so a product with
  // required variants can't bypass the prompt by using Buy Now instead.
  // It adds the selected item to the existing cart (no replacement) and
  // then jumps straight to /checkout, which is already wired to consume
  // cartItems / cartSubtotal from CartContext and POST to /api/orders.
  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setCartMessage("Please select a size.");
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setCartMessage("Please select a color.");
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);

    router.push("/checkout");
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  return (
    <div className="min-h-full">
      {wishlistMessage && (
  <div className="fixed top-24 right-4 z-[100] max-w-sm">
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
        {wishlistMessage}
      </p>
    </div>
  </div>
)}
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
        <ol className="flex items-center gap-2 text-xs md:text-sm text-stone-400">
          <li>
            <Link
              href="/"
              className="hover:text-[#2d2a26] transition-colors"
            >
              Home
            </Link>
          </li>

          <li>/</li>

          <li>
            <Link
              href="#"
              className="hover:text-[#2d2a26] transition-colors capitalize"
            >
              {product.category}
            </Link>
          </li>

          <li>/</li>

          <li className="text-[#2d2a26] font-medium truncate max-w-[200px] md:max-w-md">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Product Section */}
      <section className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-16 md:mb-20">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 shadow-sm">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                <svg
                  className="h-16 w-16"
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
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 transition-all focus:outline-none focus:ring-2 focus:ring-[#8b6f5a] ${
                    selectedImage === img
                      ? "ring-2 ring-[#8b6f5a]"
                      : "hover:ring-2 hover:ring-[#8b6f5a]"
                  }`}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={selectedImage === img}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:sticky lg:top-8 lg:self-start space-y-6">
          <div>
            <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#8b6f5a] mb-2">
              {product.category}
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-serif font-semibold text-[#2d2a26] leading-[1.15] mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating)
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

              <span className="text-sm text-stone-500">
                {product.rating.toFixed(1)}
              </span>

              <span className="text-sm text-stone-300">|</span>

              <span className="text-sm text-stone-500">
                {product.reviewCount || 0}{" "}
                {product.reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-[#2d2a26]">
₹{product.price.toFixed(2)}            </span>

            {product.originalPrice && (
              <>
                <span className="text-xl text-stone-400 line-through">
₹{product.originalPrice.toFixed(2)}                </span>

                <span className="text-sm font-semibold text-[#8b6f5a] bg-[#8b6f5a]/10 px-2 py-0.5 rounded-full">
                  {Math.round(
                    (1 - product.price / product.originalPrice) * 100
                  )}
                  % off
                </span>
              </>
            )}
          </div>

          <p className="text-[#5a5248] leading-relaxed">
            {product.description}
          </p>

          {product.youtubeVideo && (
            <div className="pt-2">
              <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-[#2d2a26] mb-3">
                Product Video
              </h3>
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-stone-100 shadow-sm">
                <iframe
                  src={
                    product.youtubeEmbedUrl ??
                    getYouTubeEmbedUrl(product.youtubeVideo)
                  }
                  title={`${product.name} product video`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-[#2d2a26] mb-3">
                Size
              </h3>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setCartMessage("");
                      }}
                      aria-pressed={isSelected}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#8b6f5a] focus:ring-offset-1 ${
                        isSelected
                          ? "border-[#2d2a26] bg-[#2d2a26] text-white"
                          : "border-stone-200 text-[#2d2a26] hover:border-[#2d2a26] hover:bg-[#2d2a26] hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-[#2d2a26] mb-3">
                Color
              </h3>

              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color.name;

                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color.name);
                        setCartMessage("");
                      }}
                      aria-label={color.name}
                      aria-pressed={isSelected}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-[#8b6f5a] focus:ring-offset-1 ${
                        isSelected
                          ? "border-[#2d2a26] bg-stone-50"
                          : "border-stone-200 hover:border-[#2d2a26]"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border border-stone-200 shadow-sm ${
                          isSelected ? "ring-2 ring-[#8b6f5a] ring-offset-1" : ""
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />

                      <span className="text-sm text-[#2d2a26]">
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-[#2d2a26] mb-3">
              Quantity
            </h3>

            <div className="inline-flex items-center border border-stone-200 rounded-full overflow-hidden">
              <button
                type="button"
                onClick={decreaseQuantity}
                className="px-3 py-2.5 text-stone-400 hover:text-[#2d2a26] hover:bg-stone-50 transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span className="px-3 text-sm font-medium text-[#2d2a26] min-w-[2rem] text-center">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                className="px-3 py-2.5 text-stone-400 hover:text-[#2d2a26] hover:bg-stone-50 transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Cart Message */}
          {cartMessage && (
            <div
              className={`text-sm font-medium ${
                cartMessage === "Added to cart!"
                  ? "text-green-700"
                  : "text-[#8b6f5a]"
              }`}
              role="status"
            >
              {cartMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-[#2d2a26] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
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

            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 bg-[#8b6f5a] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#6d5540] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              Buy Now
            </button>

            <button
  type="button"
onClick={() => {
  const currentlyWishlisted = isWishlisted(product.id);

  toggleWishlist(product);

  setWishlistMessage(
    currentlyWishlisted
      ? "Removed from wishlist."
      : "Added to wishlist!"
  );

  window.setTimeout(() => {
    setWishlistMessage("");
  }, 2500);
}}  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-200 ${
    isWishlisted(product.id)
      ? "border-red-200 bg-red-50 text-red-500"
      : "border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
  }`}
  aria-label={
    isWishlisted(product.id)
      ? "Remove from wishlist"
      : "Add to wishlist"
  }
  aria-pressed={isWishlisted(product.id)}
>
  <svg
    className="w-5 h-5"
    fill={isWishlisted(product.id) ? "currentColor" : "none"}
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
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="mb-16 md:mb-20">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-serif font-semibold text-[#2d2a26] mb-3">
                Description
              </h2>
              <p className="text-[#5a5248] leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-semibold text-[#2d2a26] mb-3">
                Materials
              </h2>
              <p className="text-[#5a5248] leading-relaxed">
                {product.materials}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#2d2a26] mb-3">
                Shipping
              </h3>
              <p className="text-sm text-[#5a5248] leading-relaxed">
                {product.shipping}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#2d2a26] mb-3">
                Returns
              </h3>
              <p className="text-sm text-[#5a5248] leading-relaxed">
                {product.returns}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <Reviews productId={product.id} />

      {/* Related Products */}
      <section className="mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#2d2a26] mb-8">
          Related Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
{related.map((p) => (
  <ProductCard key={p.id} product={p} />
))}        </div>
      </section>
    </div>
  );
}
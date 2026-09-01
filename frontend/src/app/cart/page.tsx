"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";

const FREE_SHIPPING_THRESHOLD = 100;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
  } = useCart();

  const shipping = 0;

  const total = cartSubtotal + shipping;

  const shippingProgress = Math.min(
    100,
    (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - cartSubtotal
  );

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <main className="min-h-[75vh] bg-[#faf9f7] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-white border border-stone-100 shadow-sm">
            <svg
              className="h-8 w-8 text-[#8b6f5a]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l1.5 12.5a2 2 0 002 1.5h8.8a2 2 0 001.9-1.4L21 8H6"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 21h.01M17 21h.01"
              />
            </svg>
          </div>

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b6f5a]">
            Your Shopping Bag
          </p>

          <h1 className="font-serif text-4xl font-semibold text-[#2d2a26] md:text-5xl">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#6b6258]">
            There&apos;s nothing here yet. Discover thoughtfully selected
            pieces and find something special for yourself or someone you love.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#2d2a26] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1a1a1a] hover:shadow-md"
          >
            Start Shopping
          </Link>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-stone-400">
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-stone-100">
                ✓
              </span>
              Curated gifts
            </span>

            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-stone-100">
                ✓
              </span>
              Secure checkout
            </span>

            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-stone-100">
                ✓
              </span>
              Carefully packed
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        {/* Header */}
        <header className="mb-8 md:mb-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b6f5a]">
                Shopping Bag
              </p>

              <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#2d2a26] md:text-5xl">
                Your Cart
              </h1>

              <p className="mt-2 text-sm text-stone-500">
                {totalItems}{" "}
                {totalItems === 1 ? "item" : "items"} ready for checkout
              </p>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="self-start rounded-full px-3 py-2 text-xs font-medium text-stone-500 transition-colors hover:bg-white hover:text-red-600 sm:self-auto"
            >
              Clear cart
            </button>
          </div>
        </header>

        {/* Free Shipping Progress */}
        <div className="mb-8 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#2d2a26]">
                {remainingForFreeShipping > 0
                  ? `You’re ${formatPrice(
                      remainingForFreeShipping
                    )} away from free shipping`
                  : "You’ve unlocked free shipping"}
              </p>

              <p className="mt-1 text-xs text-stone-400">
                Complimentary shipping on orders over{" "}
                {formatPrice(FREE_SHIPPING_THRESHOLD)}.
              </p>
            </div>

            <span className="text-xs font-semibold text-[#8b6f5a]">
              {Math.round(shippingProgress)}%
            </span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-[#8b6f5a] transition-all duration-500"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          {/* Items */}
          <section aria-label="Shopping cart items" className="space-y-4">
            {cartItems.map((item) => {
              const lineTotal = item.product.price * item.quantity;

              return (
                <article
                  key={item.cartItemId}
                  className="group rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.product.id}`}
                      className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-36 sm:w-32"
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 96px, 128px"
                      />
                    </Link>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b6f5a]">
                            {item.product.category}
                          </p>

                          <Link
                            href={`/products/${item.product.id}`}
                            className="block truncate font-serif text-lg font-semibold text-[#2d2a26] transition-colors hover:text-[#8b6f5a] sm:text-xl"
                          >
                            {item.product.name}
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.cartItemId)
                          }
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-50 hover:text-red-500"
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Variants */}
                      {(item.selectedSize || item.selectedColor) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.selectedSize && (
                            <span className="rounded-full bg-stone-50 px-3 py-1.5 text-[11px] text-stone-500">
                              Size{" "}
                              <strong className="font-medium text-[#2d2a26]">
                                {item.selectedSize}
                              </strong>
                            </span>
                          )}

                          {item.selectedColor && (
                            <span className="rounded-full bg-stone-50 px-3 py-1.5 text-[11px] text-stone-500">
                              Color{" "}
                              <strong className="font-medium text-[#2d2a26]">
                                {item.selectedColor}
                              </strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bottom */}
                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        {/* Quantity */}
                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                            Quantity
                          </p>

                          <div className="inline-flex items-center rounded-full border border-stone-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemId,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="flex h-9 w-9 items-center justify-center rounded-l-full text-lg text-stone-500 transition-colors hover:bg-stone-50 hover:text-[#2d2a26] disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Decrease quantity of ${item.product.name}`}
                            >
                              −
                            </button>

                            <span
                              className="min-w-10 text-center text-sm font-semibold text-[#2d2a26]"
                              aria-label={`Quantity ${item.quantity}`}
                            >
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemId,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-r-full text-lg text-stone-500 transition-colors hover:bg-stone-50 hover:text-[#2d2a26]"
                              aria-label={`Increase quantity of ${item.product.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="sm:text-right">
                          <p className="text-lg font-semibold text-[#2d2a26]">
                            {formatPrice(lineTotal)}
                          </p>

                          <p className="mt-1 text-xs text-stone-400">
                            {formatPrice(item.product.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Continue Shopping */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-[#5a5248] transition-colors hover:text-[#8b6f5a]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Continue shopping
            </Link>
          </section>

          {/* Summary */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="font-serif text-2xl font-semibold text-[#2d2a26]">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between text-stone-500">
                  <span>
                    Subtotal{" "}
                    <span className="text-xs">
                      ({totalItems} items)
                    </span>
                  </span>

                  <span className="font-medium text-[#2d2a26]">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-500">
                  <span>Shipping</span>

                  <span className="font-medium text-[#2d2a26]">
                    {shipping === 0
                      ? "Free"
                      : formatPrice(shipping)}
                  </span>
                </div>

                <div className="border-t border-stone-100 pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#2d2a26]">
                        Total
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        Taxes calculated at checkout
                      </p>
                    </div>

                    <p className="text-2xl font-semibold tracking-tight text-[#2d2a26]">
                      {formatPrice(total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkout */}
              <Link
                href="/checkout"
                className="mt-7 flex w-full items-center justify-center rounded-full bg-[#8b6f5a] px-6 py-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#6d5540] hover:shadow-md"
              >
                Proceed to Checkout
              </Link>

              <p className="mt-3 text-center text-[11px] leading-relaxed text-stone-400">
                Secure checkout · Your cart is saved automatically
              </p>

              {/* Trust */}
              <div className="mt-7 border-t border-stone-100 pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#8b6f5a]/10">
                      <svg
                        className="h-4 w-4 text-[#8b6f5a]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14M12 5l7 7-7 7"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#2d2a26]">
                        Carefully packed
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-stone-400">
                        Every order is prepared with care.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#8b6f5a]/10">
                      <svg
                        className="h-4 w-4 text-[#8b6f5a]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zM8 7V5a4 4 0 018 0v2"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#2d2a26]">
                        Secure checkout
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-stone-400">
                        Your checkout experience is protected.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#8b6f5a]/10">
                      <svg
                        className="h-4 w-4 text-[#8b6f5a]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 12h15M13 6l6 6-6 6M19 19h2"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#2d2a26]">
                        Delivery made simple
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-stone-400">
                        Shipping details are shown during checkout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
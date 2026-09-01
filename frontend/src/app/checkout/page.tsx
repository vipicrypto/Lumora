"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";


type DeliveryOption = "standard" | "express";

export default function CheckoutPage() {
  const router = useRouter();

  const { cartItems, cartSubtotal, clearCart } = useCart();

  const [delivery, setDelivery] =
    useState<DeliveryOption>("standard");

  const [formError, setFormError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });

  const standardShipping = cartSubtotal >= 50 ? 0 : 6.99;
  const expressShipping = 14.99;

  const shipping =
    delivery === "standard"
      ? standardShipping
      : expressShipping;

  const total = cartSubtotal + shipping;

  const updateField = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#2d2a26] mb-3">
            Your Cart is Empty
          </h1>

          <p className="text-[#5a5248] leading-relaxed mb-8">
            Add something beautiful to your cart before continuing
            to checkout.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#2d2a26] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#2d2a26] transition-colors mb-5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Cart
          </Link>

          <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#8b6f5a] mb-2">
            Secure Checkout
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-[#2d2a26]">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Enter your details and choose your delivery option.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
          {/* Checkout Form */}
          <section className="space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sm:p-7">
              <div className="mb-6">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#8b6f5a] mb-1">
                  Step 01
                </p>

                <h2 className="text-xl font-serif font-semibold text-[#2d2a26]">
                  Contact Information
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-[#2d2a26] mb-2"
                  >
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      updateField("fullName", e.target.value)
                    }
                    placeholder="Your full name"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#2d2a26] mb-2"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[#2d2a26] mb-2"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sm:p-7">
              <div className="mb-6">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#8b6f5a] mb-1">
                  Step 02
                </p>

                <h2 className="text-xl font-serif font-semibold text-[#2d2a26]">
                  Shipping Address
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-[#2d2a26] mb-2"
                  >
                    Street Address
                  </label>

                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      updateField("address", e.target.value)
                    }
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-[#2d2a26] mb-2"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      updateField("city", e.target.value)
                    }
                    placeholder="New York"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-[#2d2a26] mb-2"
                  >
                    State / Province
                  </label>

                  <input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      updateField("state", e.target.value)
                    }
                    placeholder="New York"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-[#2d2a26] mb-2"
                  >
                    Postal Code
                  </label>

                  <input
                    id="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) =>
                      updateField("postalCode", e.target.value)
                    }
                    placeholder="10001"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-[#2d2a26] mb-2"
                  >
                    Country
                  </label>

                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      updateField("country", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Norway</option>
                    <option>India</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sm:p-7">
              <div className="mb-6">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#8b6f5a] mb-1">
                  Step 03
                </p>

                <h2 className="text-xl font-serif font-semibold text-[#2d2a26]">
                  Delivery Method
                </h2>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setDelivery("standard")}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    delivery === "standard"
                      ? "border-[#8b6f5a] bg-[#8b6f5a]/5"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                          delivery === "standard"
                            ? "border-[#8b6f5a]"
                            : "border-stone-300"
                        }`}
                      >
                        {delivery === "standard" && (
                          <span className="w-2 h-2 rounded-full bg-[#8b6f5a]" />
                        )}
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-[#2d2a26]">
                          Standard Delivery
                        </p>

                        <p className="text-xs text-stone-500 mt-1">
                          Arrives in 5–7 business days
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-semibold text-[#2d2a26]">
                      {standardShipping === 0
                        ? "Free"
                        : `$${standardShipping.toFixed(2)}`}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDelivery("express")}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    delivery === "express"
                      ? "border-[#8b6f5a] bg-[#8b6f5a]/5"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                          delivery === "express"
                            ? "border-[#8b6f5a]"
                            : "border-stone-300"
                        }`}
                      >
                        {delivery === "express" && (
                          <span className="w-2 h-2 rounded-full bg-[#8b6f5a]" />
                        )}
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-[#2d2a26]">
                          Express Delivery
                        </p>

                        <p className="text-xs text-stone-500 mt-1">
                          Arrives in 2–3 business days
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-semibold text-[#2d2a26]">
                      $14.99
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sm:p-7">
              <h2 className="text-xl font-serif font-semibold text-[#2d2a26] mb-6">
                Order Summary
              </h2>

              <div className="space-y-5">
                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex gap-3"
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />

                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#2d2a26] text-white text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2d2a26] line-clamp-2">
                        {item.product.name}
                      </p>

                      {(item.selectedSize ||
                        item.selectedColor) && (
                        <p className="text-[11px] text-stone-400 mt-1">
                          {item.selectedSize &&
                            `Size: ${item.selectedSize}`}
                          {item.selectedSize &&
                            item.selectedColor &&
                            " • "}
                          {item.selectedColor &&
                            `Color: ${item.selectedColor}`}
                        </p>
                      )}

                      <p className="text-sm font-semibold text-[#2d2a26] mt-2">
                        $
                        {(
                          item.product.price *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 my-6" />

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#2d2a26]">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-500">
                  <span>Shipping</span>
                  <span className="font-medium text-[#2d2a26]">
                    {shipping === 0
                      ? "Free"
                      : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-stone-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2d2a26]">
                      Total
                    </span>

                    <span className="text-2xl font-semibold text-[#2d2a26]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

{formError && (
  <p className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
    {formError}
  </p>
)}

<button
  type="button"
  disabled={isPlacingOrder}
  onClick={() => {
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      setFormError("Please complete all required fields.");
      return;
    }

    setFormError("");
    setIsPlacingOrder(true);

    const orderId = `LUM-${Date.now().toString().slice(-8)}`;

    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: formData,
      delivery,
      items: cartItems,
      subtotal: cartSubtotal,
      shipping,
      total,
      status: "Placed",
    };

    try {
      const existingOrders = JSON.parse(
        localStorage.getItem("lumoraOrders") || "[]"
      );

      localStorage.setItem(
        "lumoraOrders",
        JSON.stringify([order, ...existingOrders])
      );

      clearCart();

      router.push(`/order-success?order=${orderId}`);
    } catch {
      setFormError("Something went wrong. Please try again.");
      setIsPlacingOrder(false);
    }
  }}
  className="w-full mt-7 bg-[#8b6f5a] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#6d5540] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
>
  {isPlacingOrder ? "Placing Order..." : "Place Order"}
</button>
              <p className="text-[11px] text-stone-400 text-center mt-4 leading-relaxed">
                By placing your order, you agree to our terms and
                conditions.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
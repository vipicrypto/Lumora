"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

type DeliveryOption = "standard" | "express";
type PaymentMethod = "COD" | "RAZORPAY";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cartItems,
    cartSubtotal,
    clearCart,
  } = useCart();

  const [delivery, setDelivery] =
    useState<DeliveryOption>("standard");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("COD");

  const [formError, setFormError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  const [isRazorpayLoaded, setIsRazorpayLoaded] =
    useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  /*
   * ------------------------------------------------------------------------
   * LOAD RAZORPAY CHECKOUT SCRIPT
   * ------------------------------------------------------------------------
   */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.Razorpay) {
      setIsRazorpayLoaded(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        setIsRazorpayLoaded(true);
      });

      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      setIsRazorpayLoaded(true);
    };

    script.onerror = () => {
      setIsRazorpayLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  /*
   * ------------------------------------------------------------------------
   * PRICING
   * ------------------------------------------------------------------------
   */

  const standardShipping =
    cartSubtotal >= 4500 ? 0 : 629;

  const expressShipping = 1349;

  const shipping =
    delivery === "standard"
      ? standardShipping
      : expressShipping;

  const total = cartSubtotal + shipping;

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  const updateField = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
   * ------------------------------------------------------------------------
   * SAVE ORDER TO LUMORA DATABASE
   * ------------------------------------------------------------------------
   */

  const saveOrder = async ({
    orderId,
    paymentId,
    razorpayOrderId,
  }: {
    orderId: string;
    paymentId?: string;
    razorpayOrderId?: string;
  }) => {
    const order = {
      id: orderId,

      customer: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },

      delivery,

      items: cartItems.map((item) => ({
        productId: String(item.product.id),
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice:
          item.product.price * item.quantity,
      })),

      subtotal: cartSubtotal,
      shipping,
      total,

      paymentMethod,

      ...(paymentId
        ? {
            razorpayPaymentId: paymentId,
          }
        : {}),

      ...(razorpayOrderId
        ? {
            razorpayOrderId,
          }
        : {}),
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    let data: {
      error?: string;
      success?: boolean;
    } = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to save your order."
      );
    }

    return data;
  };

  /*
   * ------------------------------------------------------------------------
   * VERIFY RAZORPAY PAYMENT
   * ------------------------------------------------------------------------
   */

  const verifyRazorpayPayment = async (
    response: RazorpayResponse,
    orderId: string
  ) => {
    try {
      const verifyResponse = await fetch(
        "/api/payment/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razorpay_order_id:
              response.razorpay_order_id,

            razorpay_payment_id:
              response.razorpay_payment_id,

            razorpay_signature:
              response.razorpay_signature,
          }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (
        !verifyResponse.ok ||
        !verifyData.success ||
        !verifyData.verified
      ) {
        throw new Error(
          verifyData.error ||
            "Payment verification failed."
        );
      }

      /*
       * Payment is verified.
       * Only now create the actual Lumora order.
       */

      await saveOrder({
        orderId,
        paymentId:
          response.razorpay_payment_id,
        razorpayOrderId:
          response.razorpay_order_id,
      });

      clearCart();

      router.push(
        `/order-success?order=${encodeURIComponent(
          orderId
        )}`
      );
    } catch (error) {
      console.error(
        "Razorpay verification error:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Payment verification failed. Please contact support."
      );

      setIsPlacingOrder(false);
    }
  };

  /*
   * ------------------------------------------------------------------------
   * OPEN RAZORPAY CHECKOUT
   * ------------------------------------------------------------------------
   */

  const openRazorpayCheckout = async (
    orderId: string
  ) => {
    try {
      if (!isRazorpayLoaded || !window.Razorpay) {
        setFormError(
          "Razorpay is still loading. Please wait a moment and try again."
        );

        setIsPlacingOrder(false);
        return;
      }

      /*
       * Create Razorpay order on the server.
       *
       * Amount is sent in INR.
       * Server converts it to paise.
       */

      const createOrderResponse = await fetch(
        "/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total,
            receipt: orderId,
          }),
        }
      );

      const createOrderData =
        await createOrderResponse.json();

      if (
        !createOrderResponse.ok ||
        !createOrderData.success
      ) {
        throw new Error(
          createOrderData.error ||
            "Unable to create Razorpay order."
        );
      }

      const razorpayOrder =
        createOrderData.order;

      const keyId =
        createOrderData.keyId;

      if (!razorpayOrder?.id || !keyId) {
        throw new Error(
          "Invalid Razorpay order response."
        );
      }

      const options: RazorpayOptions = {
        key: keyId,

        amount: razorpayOrder.amount,

        currency:
          razorpayOrder.currency || "INR",

        name: "Lumora",

        description:
          "Lumora e-commerce purchase",

        order_id: razorpayOrder.id,

        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },

        notes: {
          address: [
            formData.address,
            formData.city,
            formData.state,
            formData.postalCode,
            formData.country,
          ]
            .filter(Boolean)
            .join(", "),
        },

        theme: {
          color: "#8b6f5a",
        },

        handler: async (
          response: RazorpayResponse
        ) => {
          await verifyRazorpayPayment(
            response,
            orderId
          );
        },

        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
            setFormError(
              "Payment was cancelled. Your order has not been placed."
            );
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(
        "Razorpay checkout error:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to start Razorpay payment."
      );

      setIsPlacingOrder(false);
    }
  };

  /*
   * ------------------------------------------------------------------------
   * PLACE ORDER
   * ------------------------------------------------------------------------
   */

  const placeOrder = async () => {
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      setFormError(
        "Please complete all required fields."
      );

      return;
    }

    setFormError("");
    setIsPlacingOrder(true);

    const orderId = `LUM-${Date.now()
      .toString()
      .slice(-8)}`;

    /*
     * ----------------------------------------------------------------------
     * RAZORPAY PAYMENT
     * ----------------------------------------------------------------------
     */

    if (paymentMethod === "RAZORPAY") {
      await openRazorpayCheckout(orderId);
      return;
    }

    /*
     * ----------------------------------------------------------------------
     * CASH ON DELIVERY
     * ----------------------------------------------------------------------
     */

    try {
      await saveOrder({
        orderId,
      });

      clearCart();

      router.push(
        `/order-success?order=${encodeURIComponent(
          orderId
        )}`
      );
    } catch (error) {
      console.error(
        "COD order placement error:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to place order. Please try again."
      );

      setIsPlacingOrder(false);
    }
  };

  /*
   * ------------------------------------------------------------------------
   * EMPTY CART
   * ------------------------------------------------------------------------
   */

  if (cartItems.length === 0) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">

          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.7"
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
            Add something beautiful to your cart before
            continuing to checkout.
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

  /*
   * ------------------------------------------------------------------------
   * CHECKOUT PAGE
   * ------------------------------------------------------------------------
   */

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
              viewBox="0 0 24 24"
              strokeWidth="1.8"
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
            Enter your details and choose your delivery and payment option.
          </p>

        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">

          {/* Checkout Form */}
          <section className="space-y-6">

            {/* Contact Information */}
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
                      updateField(
                        "fullName",
                        e.target.value
                      )
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
                      updateField(
                        "email",
                        e.target.value
                      )
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
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="+91 98765 43210"
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
                      updateField(
                        "address",
                        e.target.value
                      )
                    }
                    placeholder="House / Building / Street"
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
                      updateField(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="City"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  />

                </div>

                <div>

                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-[#2d2a26] mb-2"
                  >
                    State
                  </label>

                  <input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      updateField(
                        "state",
                        e.target.value
                      )
                    }
                    placeholder="Kerala"
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
                      updateField(
                        "postalCode",
                        e.target.value
                      )
                    }
                    placeholder="679xxx"
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
                      updateField(
                        "country",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a]/50 transition-all"
                  >
                    <option>India</option>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Norway</option>
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

                {/* Standard */}
                <button
                  type="button"
                  onClick={() =>
                    setDelivery("standard")
                  }
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
                        : formatCurrency(
                            standardShipping
                          )}
                    </span>

                  </div>
                </button>

                {/* Express */}
                <button
                  type="button"
                  onClick={() =>
                    setDelivery("express")
                  }
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
                      {formatCurrency(
                        expressShipping
                      )}
                    </span>

                  </div>
                </button>

              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sm:p-7">

              <div className="mb-6">

                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#8b6f5a] mb-1">
                  Step 04
                </p>

                <h2 className="text-xl font-serif font-semibold text-[#2d2a26]">
                  Payment Method
                </h2>

              </div>

              <div className="space-y-3">

                {/* COD */}
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("COD")
                  }
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    paymentMethod === "COD"
                      ? "border-[#8b6f5a] bg-[#8b6f5a]/5"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <span
                        className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "COD"
                            ? "border-[#8b6f5a]"
                            : "border-stone-300"
                        }`}
                      >
                        {paymentMethod === "COD" && (
                          <span className="w-2 h-2 rounded-full bg-[#8b6f5a]" />
                        )}
                      </span>

                      <div>

                        <p className="text-sm font-semibold text-[#2d2a26]">
                          Cash on Delivery
                        </p>

                        <p className="text-xs text-stone-500 mt-1">
                          Pay when your order arrives
                        </p>

                      </div>

                    </div>

                    <span className="text-xs font-semibold text-stone-500">
                      COD
                    </span>

                  </div>

                </button>

                {/* Razorpay */}
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("RAZORPAY")
                  }
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    paymentMethod === "RAZORPAY"
                      ? "border-[#8b6f5a] bg-[#8b6f5a]/5"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <span
                        className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "RAZORPAY"
                            ? "border-[#8b6f5a]"
                            : "border-stone-300"
                        }`}
                      >
                        {paymentMethod === "RAZORPAY" && (
                          <span className="w-2 h-2 rounded-full bg-[#8b6f5a]" />
                        )}
                      </span>

                      <div>

                        <p className="text-sm font-semibold text-[#2d2a26]">
                          Online Payment
                        </p>

                        <p className="text-xs text-stone-500 mt-1">
                          UPI, Cards, Net Banking & more
                        </p>

                      </div>

                    </div>

                    <span className="text-xs font-semibold text-[#8b6f5a]">
                      Razorpay
                    </span>

                  </div>

                </button>

              </div>

              {paymentMethod === "RAZORPAY" && (
                <div className="mt-4 rounded-xl bg-stone-50 border border-stone-100 px-4 py-3">

                  <p className="text-xs text-stone-500 leading-relaxed">
                    You will be securely redirected to Razorpay Checkout
                    after clicking the payment button.
                  </p>

                </div>
              )}

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
                        {formatCurrency(
                          item.product.price *
                            item.quantity
                        )}
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
                    {formatCurrency(cartSubtotal)}
                  </span>

                </div>

                <div className="flex items-center justify-between text-stone-500">

                  <span>Shipping</span>

                  <span className="font-medium text-[#2d2a26]">
                    {shipping === 0
                      ? "Free"
                      : formatCurrency(shipping)}
                  </span>

                </div>

                <div className="border-t border-stone-100 pt-4">

                  <div className="flex items-center justify-between">

                    <span className="font-semibold text-[#2d2a26]">
                      Total
                    </span>

                    <span className="text-2xl font-semibold text-[#2d2a26]">
                      {formatCurrency(total)}
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
                disabled={
                  isPlacingOrder ||
                  (paymentMethod === "RAZORPAY" &&
                    !isRazorpayLoaded)
                }
                onClick={placeOrder}
                className="w-full mt-7 bg-[#8b6f5a] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#6d5540] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >

                {isPlacingOrder
                  ? paymentMethod === "RAZORPAY"
                    ? "Opening Payment..."
                    : "Placing Order..."
                  : paymentMethod === "RAZORPAY"
                    ? isRazorpayLoaded
                      ? "Pay Securely"
                      : "Loading Payment..."
                    : "Place Order"}

              </button>

              <p className="text-[11px] text-stone-400 text-center mt-4 leading-relaxed">
                By placing your order, you agree to our terms and
                conditions.
              </p>

              {paymentMethod === "RAZORPAY" && (
                <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-stone-400">

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                      d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                    />
                  </svg>

                  Secure payment powered by Razorpay

                </div>
              )}

            </div>

          </aside>

        </div>
      </div>

    </main>
  );
}

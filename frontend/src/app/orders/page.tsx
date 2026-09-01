"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface OrderItem {
  cartItemId: string;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface Order {
  id: string;
  createdAt: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  delivery: "standard" | "express";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem("lumoraOrders");

      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch {
      setOrders([]);
    }
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (orders.length === 0) {
    return (
      <main className="min-h-[75vh] bg-[#faf9f7] flex items-center justify-center px-4 py-16">
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
                d="M9 5H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M9 5a2 2 0 002 2h4M9 5a2 2 0 012-2h4l5 5v6"
              />
            </svg>
          </div>

          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8b6f5a] mb-2">
            Order History
          </p>

          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#2d2a26] mb-3">
            No Orders Yet
          </h1>

          <p className="text-[#5a5248] leading-relaxed mb-8">
            Once you place an order, your order history will appear here.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#2d2a26] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/account"
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
            Back to Account
          </Link>

          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8b6f5a] mb-2">
            Your Orders
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-[#2d2a26]">
            Order History
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            {orders.length}{" "}
            {orders.length === 1 ? "order" : "orders"} placed
          </p>
        </div>

        {/* Orders */}
        <div className="space-y-6">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-5 sm:p-6 border-b border-stone-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-stone-400 mb-1">
                      Order Number
                    </p>

                    <h2 className="text-lg font-semibold text-[#2d2a26]">
                      {order.id}
                    </h2>

                    <p className="text-xs text-stone-500 mt-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="sm:text-right">
                      <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-1">
                        Total
                      </p>

                      <p className="text-lg font-semibold text-[#2d2a26]">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>

                    <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="p-5 sm:p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex gap-4"
                    >
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-medium text-[#2d2a26]">
                          {item.product.name}
                        </h3>

                        {(item.selectedSize ||
                          item.selectedColor) && (
                          <p className="text-xs text-stone-400 mt-1">
                            {item.selectedSize &&
                              `Size: ${item.selectedSize}`}
                            {item.selectedSize &&
                              item.selectedColor &&
                              " • "}
                            {item.selectedColor &&
                              `Color: ${item.selectedColor}`}
                          </p>
                        )}

                        <p className="text-xs text-stone-500 mt-2">
                          Quantity: {item.quantity}
                        </p>

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

                {/* Delivery */}
                <div className="border-t border-stone-100 mt-6 pt-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-wide uppercase text-stone-400 mb-1">
                        Delivery
                      </p>

                      <p className="text-sm text-[#2d2a26]">
                        {order.delivery === "express"
                          ? "Express Delivery"
                          : "Standard Delivery"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold tracking-wide uppercase text-stone-400 mb-1">
                        Shipping To
                      </p>

                      <p className="text-sm text-[#2d2a26]">
                        {order.customer.city},{" "}
                        {order.customer.state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t border-stone-100 mt-5 pt-5">
                  <div className="max-w-sm ml-auto space-y-2 text-sm">
                    <div className="flex justify-between text-stone-500">
                      <span>Subtotal</span>
                      <span className="text-[#2d2a26]">
                        ${order.subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-stone-500">
                      <span>Shipping</span>
                      <span className="text-[#2d2a26]">
                        {order.shipping === 0
                          ? "Free"
                          : `$${order.shipping.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="border-t border-stone-100 pt-3 flex justify-between font-semibold">
                      <span className="text-[#2d2a26]">
                        Total
                      </span>

                      <span className="text-[#2d2a26]">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-stone-200 bg-white text-[#2d2a26] px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-stone-50 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
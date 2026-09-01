"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  items: {
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
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
}

export default function AccountPage() {
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

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8b6f5a] mb-2">
            Your Account
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-[#2d2a26]">
            My Account
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Manage your orders and shopping activity.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <Link
            href="/orders"
            className="group bg-white rounded-2xl border border-stone-100 p-5 hover:border-stone-200 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center mb-4 group-hover:bg-[#8b6f5a]/10 transition-colors">
              <svg
                className="w-5 h-5 text-[#8b6f5a]"
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

            <h2 className="font-semibold text-[#2d2a26]">
              My Orders
            </h2>

            <p className="text-xs text-stone-500 mt-1">
              View your order history and details.
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="group bg-white rounded-2xl border border-stone-100 p-5 hover:border-stone-200 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center mb-4 group-hover:bg-[#8b6f5a]/10 transition-colors">
              <svg
                className="w-5 h-5 text-[#8b6f5a]"
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

            <h2 className="font-semibold text-[#2d2a26]">
              Wishlist
            </h2>

            <p className="text-xs text-stone-500 mt-1">
              View products you&apos;ve saved.
            </p>
          </Link>

          <Link
            href="/cart"
            className="group bg-white rounded-2xl border border-stone-100 p-5 hover:border-stone-200 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center mb-4 group-hover:bg-[#8b6f5a]/10 transition-colors">
              <svg
                className="w-5 h-5 text-[#8b6f5a]"
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

            <h2 className="font-semibold text-[#2d2a26]">
              Shopping Cart
            </h2>

            <p className="text-xs text-stone-500 mt-1">
              Continue shopping or review your cart.
            </p>
          </Link>
        </div>

        {/* Recent Orders */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8b6f5a] mb-1">
                Recent Activity
              </p>

              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#2d2a26]">
                Recent Orders
              </h2>
            </div>

            {orders.length > 0 && (
              <Link
                href="/orders"
                className="text-sm font-medium text-[#8b6f5a] hover:text-[#2d2a26] transition-colors"
              >
                View all
              </Link>
            )}
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs text-stone-400 mb-1">
                        Order Number
                      </p>

                      <p className="font-semibold text-[#2d2a26]">
                        {order.id}
                      </p>

                      <p className="text-xs text-stone-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-stone-400 mb-1">
                          Total
                        </p>

                        <p className="font-semibold text-[#2d2a26]">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>

                      <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-stone-100 mt-5 pt-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {order.items.slice(0, 4).map((item) => (
                        <div
                          key={item.cartItemId}
                          className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 rounded-full px-3 py-2"
                        >
                          <span>{item.product.name}</span>
                          <span className="text-stone-400">
                            × {item.quantity}
                          </span>
                        </div>
                      ))}

                      {order.items.length > 4 && (
                        <span className="text-xs text-stone-400">
                          +{order.items.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 p-8 md:p-12 text-center">
              <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-stone-400"
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

              <h3 className="text-xl font-serif font-semibold text-[#2d2a26] mb-2">
                No orders yet
              </h3>

              <p className="text-sm text-stone-500 mb-6">
                Your completed orders will appear here.
              </p>

              <Link
                href="/"
                className="inline-flex items-center justify-center bg-[#2d2a26] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
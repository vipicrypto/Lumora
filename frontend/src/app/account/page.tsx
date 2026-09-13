"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
interface User {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

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
  paymentMethod?: string;
}

/* -------------------------------------------------------------
   Currency
------------------------------------------------------------- */

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/* -------------------------------------------------------------
   Date + Time
------------------------------------------------------------- */

function formatOrderDateTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/* -------------------------------------------------------------
   Stable Latest-First Sorting
------------------------------------------------------------- */

function sortOrdersLatestFirst(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();

    const validA = Number.isFinite(timeA);
    const validB = Number.isFinite(timeB);

    if (validA && validB && timeA !== timeB) {
      return timeB - timeA;
    }

    if (validA && !validB) {
      return -1;
    }

    if (!validA && validB) {
      return 1;
    }

    return String(b.id).localeCompare(String(a.id));
  });
}

/* -------------------------------------------------------------
   Safe Image
------------------------------------------------------------- */

function getSafeImageUrl(image: unknown): string | null {
  if (typeof image !== "string") {
    return null;
  }

  const value = image.trim();

  if (!value) {
    return null;
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol === "http:" ||
      url.protocol === "https:"
    ) {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

/* -------------------------------------------------------------
   Status
------------------------------------------------------------- */

function getStatusClass(status: string) {
  switch (String(status || "").toUpperCase()) {
    case "DELIVERED":
      return "bg-green-50 text-green-700";

    case "SHIPPED":
      return "bg-blue-50 text-blue-700";

    case "PROCESSING":
      return "bg-purple-50 text-purple-700";

    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700";

    case "CANCELLED":
    case "CANCELED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

/* -------------------------------------------------------------
   Account Page
------------------------------------------------------------- */

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);

  const [loggingOut, setLoggingOut] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(true);

  const [ordersError, setOrdersError] = useState("");

  /* -----------------------------------------------------------
     Load Current User
  ----------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        setLoadingUser(true);

        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.user) {
          if (!cancelled) {
            setUser(null);
          }

          return;
        }

        if (!cancelled) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Account user error:", error);

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -----------------------------------------------------------
     Load Orders
  ----------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoadingOrders(true);
        setOrdersError("");

        const response = await fetch("/api/orders", {
          method: "GET",
          cache: "no-store",
        });

const data =
  await response.json();

if (response.status === 401) {
  router.replace(
    "/login?redirect=/account"
  );
  return;
}

if (
  !response.ok ||
  !data.success
) {
  throw new Error(
    data.error ||
      "Unable to load your recent orders."
  );
}

        const fetchedOrders: Order[] = Array.isArray(
          data.orders
        )
          ? data.orders
          : [];

        const sortedOrders =
          sortOrdersLatestFirst(fetchedOrders);

        if (!cancelled) {
          setOrders(sortedOrders);
        }
      } catch (error) {
        console.error("Account orders error:", error);

        if (!cancelled) {
          setOrders([]);

          setOrdersError(
            error instanceof Error
              ? error.message
              : "Unable to load your recent orders."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOrders(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -----------------------------------------------------------
     Logout
  ----------------------------------------------------------- */

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to logout.");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);

      setLoggingOut(false);
    }
  }

  /* -----------------------------------------------------------
     User Display
  ----------------------------------------------------------- */

  const displayName =
    user?.fullName ||
    user?.name ||
    "Welcome back";

  const displayEmail =
    user?.email || "";

  const avatarLetter =
    displayName.charAt(0).toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 md:mb-10">
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8b6f5a] mb-2">
            Your Account
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-[#2d2a26]">
            My Account
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Manage your profile, orders and shopping activity.
          </p>
        </div>

        {/* =====================================================
            PROFILE + LOGOUT
        ===================================================== */}

        <section className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 md:p-7 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div className="flex items-center gap-4 min-w-0">

              {/* Avatar */}

              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#2d2a26] text-white flex items-center justify-center text-xl sm:text-2xl font-semibold flex-shrink-0">
                {loadingUser ? "..." : avatarLetter}
              </div>

              {/* User information */}

              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8b6f5a] mb-1">
                  Profile
                </p>

                <h2 className="text-lg sm:text-xl font-semibold text-[#2d2a26] truncate">
                  {loadingUser
                    ? "Loading..."
                    : displayName}
                </h2>

                {displayEmail && (
                  <p className="text-sm text-stone-500 mt-1 truncate">
                    {displayEmail}
                  </p>
                )}

                {user?.phone && (
                  <p className="text-xs text-stone-400 mt-1">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-[#2d2a26] hover:bg-stone-50 hover:border-stone-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 17l5-5-5-5M15 12H3"
                />
              </svg>

              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>

          </div>
        </section>

        {/* =====================================================
            QUICK LINKS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">

          {/* Orders */}

          <Link
            href="/orders"
            className="group bg-white rounded-2xl border border-stone-100 p-5 hover:border-stone-200 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center mb-4">
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

          {/* Wishlist */}

          <Link
            href="/wishlist"
            className="group bg-white rounded-2xl border border-stone-100 p-5 hover:border-stone-200 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center mb-4">
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

          {/* Cart */}

          <Link
            href="/cart"
            className="group bg-white rounded-2xl border border-stone-100 p-5 hover:border-stone-200 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center mb-4">
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

        {/* =====================================================
            RECENT ORDERS
        ===================================================== */}

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

          {/* ===================================================
              LOADING
          =================================================== */}

          {loadingOrders ? (
            <div className="space-y-4">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 animate-pulse"
                >
                  <div className="flex gap-4">

                    <div className="w-16 h-16 rounded-xl bg-stone-100" />

                    <div className="flex-1 space-y-3">
                      <div className="h-3 w-20 bg-stone-200 rounded" />
                      <div className="h-5 w-40 bg-stone-200 rounded" />
                      <div className="h-3 w-36 bg-stone-200 rounded" />
                    </div>

                  </div>
                </div>
              ))}

            </div>

          ) : ordersError ? (

            /* =================================================
               ERROR
            ================================================= */

            <div className="bg-white rounded-2xl border border-red-100 p-8 md:p-12 text-center">

              <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86l-8.04 14A2 2 0 004 21h16a2 2 0 001.75-3l-8.04-14a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-serif font-semibold text-[#2d2a26] mb-2">
                Unable to load orders
              </h3>

              <p className="text-sm text-stone-500 mb-6">
                {ordersError}
              </p>

              <Link
                href="/orders"
                className="inline-flex items-center justify-center bg-[#2d2a26] text-white px-6 py-3 rounded-full text-sm font-semibold"
              >
                Open My Orders
              </Link>

            </div>

          ) : orders.length > 0 ? (

            /* =================================================
               ORDERS
            ================================================= */

            <div className="space-y-4">

              {orders.slice(0, 3).map((order) => {

                const firstItem =
                  order.items?.[0];

                const image =
                  getSafeImageUrl(
                    firstItem?.product?.image
                  );

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6"
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      {/* -------------------------------------
                          Product + Order
                      ------------------------------------- */}

                      <div className="flex gap-4 min-w-0">

                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">

                          {image ? (

                            image.startsWith("/") ? (

                              <Image
                                src={image}
                                alt={
                                  firstItem?.product
                                    ?.name ||
                                  "Product"
                                }
                                fill
                                className="object-cover"
                                sizes="64px"
                              />

                            ) : (

                              <img
                                src={image}
                                alt={
                                  firstItem?.product
                                    ?.name ||
                                  "Product"
                                }
                                className="absolute inset-0 w-full h-full object-cover"
                              />

                            )

                          ) : (

                            <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                              <svg
                                className="w-7 h-7"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="2"
                                />

                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 16l5-5 4 4 3-3 6 6"
                                />
                              </svg>
                            </div>

                          )}

                          {order.items.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-[#2d2a26] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              +{order.items.length - 1}
                            </span>
                          )}

                        </div>

                        <div className="min-w-0">

                          <p className="text-xs text-stone-400 mb-1">
                            Order Number
                          </p>

                          <p className="font-semibold text-[#2d2a26] truncate">
                            {order.id}
                          </p>

                          <p className="text-xs text-stone-500 mt-1">
                            {formatOrderDateTime(
                              order.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                      {/* -------------------------------------
                          Total + Status
                      ------------------------------------- */}

                      <div className="flex items-center gap-4">

                        <div className="text-left sm:text-right">

                          <p className="text-xs text-stone-400 mb-1">
                            Total
                          </p>

                          <p className="font-semibold text-[#2d2a26]">
                            {formatPrice(
                              order.total
                            )}
                          </p>

                        </div>

                        <span
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status ||
                            "PENDING"}
                        </span>

                      </div>

                    </div>

                    {/* ---------------------------------------
                        Items
                    --------------------------------------- */}

                    <div className="border-t border-stone-100 mt-5 pt-5">

                      <div className="flex flex-wrap items-center gap-2">

                        {order.items
                          .slice(0, 4)
                          .map((item, index) => (
                            <div
                              key={
                                item.cartItemId ||
                                `${order.id}-${item.product.id}-${index}`
                              }
                              className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 rounded-full px-3 py-2"
                            >
                              <span>
                                {item.product.name}
                              </span>

                              <span className="text-stone-400">
                                × {item.quantity}
                              </span>
                            </div>
                          ))}

                        {order.items.length > 4 && (
                          <span className="text-xs text-stone-400">
                            +{order.items.length - 4}{" "}
                            more
                          </span>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          ) : (

            /* =================================================
               NO ORDERS
            ================================================= */

            <div className="bg-white rounded-2xl border border-stone-100 p-8 md:p-12 text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-[#8b6f5a]"
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
                className="inline-flex items-center justify-center bg-[#2d2a26] text-white px-6 py-3 rounded-full text-sm font-semibold"
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

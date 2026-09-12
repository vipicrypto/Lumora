"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface OrderItem {
  cartItemId: string;
  product: Product;
  quantity: number;
}

interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  delivery: "standard" | "express";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentMethod?: string;
}

/* -------------------------------------------------------------
   Helpers
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDateTime(value: string) {
  const date = new Date(value);

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

function getStatusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "SHIPPED":
      return "bg-blue-50 text-blue-700 border-blue-100";

    case "PROCESSING":
      return "bg-amber-50 text-amber-700 border-amber-100";

    case "CONFIRMED":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-100";

    case "PENDING":
    default:
      return "bg-stone-50 text-stone-600 border-stone-200";
  }
}

function getStatusLabel(status: string) {
  const normalized = String(status || "PENDING")
    .toLowerCase()
    .replace(/_/g, " ");

  return (
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1)
  );
}

/* -------------------------------------------------------------
   Order Tracking
------------------------------------------------------------- */

function OrderTracking({ status }: { status: string }) {
  const steps = [
    {
      key: "PENDING",
      label: "Order Placed",
    },
    {
      key: "CONFIRMED",
      label: "Confirmed",
    },
    {
      key: "PROCESSING",
      label: "Processing",
    },
    {
      key: "SHIPPED",
      label: "Shipped",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
    },
  ];

  const normalizedStatus = String(
    status || "PENDING"
  ).toUpperCase();

  if (normalizedStatus === "CANCELLED") {
    return (
      <section className="border-t border-stone-100 px-5 py-6 sm:px-7">
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl font-medium text-red-600">
              ×
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-500">
                Order Tracking
              </p>

              <p className="mt-1 text-sm font-semibold text-red-700">
                Order Cancelled
              </p>

              <p className="mt-1 text-xs text-red-500">
                This order will not be delivered.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const foundIndex = steps.findIndex(
    (step) => step.key === normalizedStatus
  );

  const currentIndex =
    foundIndex >= 0 ? foundIndex : 0;

  const progress =
    currentIndex === 0
      ? 0
      : (currentIndex / (steps.length - 1)) * 100;

  return (
    <section className="border-t border-stone-100 bg-white px-5 py-7 sm:px-7">
      {/* Tracking heading */}

      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b6f5a]">
            Order Tracking
          </p>

          <h3 className="mt-1.5 text-lg font-semibold text-[#2d2a26]">
            {steps[currentIndex].label}
          </h3>

          <p className="mt-1 text-xs text-stone-400">
            Your order is currently being processed through this stage.
          </p>
        </div>

        <div className="w-fit rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500">
          Step {currentIndex + 1} of {steps.length}
        </div>
      </div>

      {/* Desktop / tablet tracker */}

      <div className="hidden sm:block">
  <div className="relative px-0">
    {/* Base line */}
    <div className="absolute left-[10%] right-[10%] top-5 h-[2px] bg-stone-200" />

    {/* Progress line */}
    <div
      className="absolute left-[10%] top-5 h-[2px] bg-[#2d2a26] transition-all duration-500"
      style={{
        width: `calc(${progress}% * 0.8)`,
      }}
    />

    <div className="relative grid grid-cols-5">
      {steps.map((step, index) => {
        const completed = index <= currentIndex;
        const current = index === currentIndex;

        return (
          <div
            key={step.key}
            className="flex flex-col items-center text-center"
          >
            <div
              className={[
                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                completed
                  ? "border-[#2d2a26] bg-[#2d2a26] text-white"
                  : "border-stone-200 bg-white text-stone-400",
                current ? "ring-4 ring-stone-100" : "",
              ].join(" ")}
            >
              {completed ? "✓" : index + 1}

              {current && (
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-stone-300/30" />
              )}
            </div>

            <p
              className={[
                "mt-3 text-[10px] font-medium md:text-xs",
                completed
                  ? "text-[#2d2a26]"
                  : "text-stone-400",
              ].join(" ")}
            >
              {step.label}
            </p>

            {current ? (
              <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8b6f5a]">
                Current
              </span>
            ) : (
              <span className="mt-1 text-[8px] text-transparent">
                Current
              </span>
            )}
          </div>
        );
      })}
    </div>
  </div>
</div>

      {/* Mobile tracker */}

      <div className="sm:hidden">
        <div className="space-y-0">
          {steps.map((step, index) => {
            const completed =
              index <= currentIndex;

            const current =
              index === currentIndex;

            const last =
              index === steps.length - 1;

            return (
              <div
                key={step.key}
                className="relative flex gap-4"
              >
                {!last && (
                  <div
                    className={[
                      "absolute left-[15px] top-8 h-[calc(100%-8px)] w-[2px]",
                      index < currentIndex
                        ? "bg-[#2d2a26]"
                        : "bg-stone-200",
                    ].join(" ")}
                  />
                )}

                <div
                  className={[
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                    completed
                      ? "border-[#2d2a26] bg-[#2d2a26] text-white"
                      : "border-stone-200 bg-white text-stone-400",
                    current
                      ? "ring-4 ring-stone-100"
                      : "",
                  ].join(" ")}
                >
                  {completed ? "✓" : index + 1}
                </div>

                <div className="pb-6 pt-1">
                  <p
                    className={[
                      "text-xs font-semibold",
                      completed
                        ? "text-[#2d2a26]"
                        : "text-stone-400",
                    ].join(" ")}
                  >
                    {step.label}
                  </p>

                  {current && (
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8b6f5a]">
                      Current status
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   Product Image
------------------------------------------------------------- */

function ProductImage({
  image,
  name,
  quantity,
}: {
  image: string;
  name: string;
  quantity: number;
}) {
  const [failed, setFailed] = useState(false);

  const imageUrl = getSafeImageUrl(image);

  const showImage =
    Boolean(imageUrl) && !failed;

  return (
    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-100 shadow-sm">
      {showImage ? (
        imageUrl!.startsWith("/") ? (
          <Image
            src={imageUrl!}
            alt={name}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setFailed(true)}
          />
        ) : (
          <img
            src={imageUrl!}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setFailed(true)}
          />
        )
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
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

          <span className="mt-1 text-[9px]">
            Image unavailable
          </span>
        </div>
      )}

      <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2d2a26] px-1.5 text-[10px] font-bold text-white shadow-sm">
        {quantity}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------
   Orders Page
------------------------------------------------------------- */

export default function OrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          "/api/orders",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        let data: {
          success?: boolean;
          orders?: Order[];
          error?: string;
        } = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Unable to load your orders."
          );
        }

        const fetchedOrders =
          Array.isArray(data.orders)
            ? data.orders
            : [];

        fetchedOrders.sort((a, b) => {
          const dateA =
            new Date(a.createdAt).getTime();

          const dateB =
            new Date(b.createdAt).getTime();

          const difference =
            dateB - dateA;

          if (difference !== 0) {
            return difference;
          }

          return String(b.id).localeCompare(
            String(a.id)
          );
        });

        if (!cancelled) {
          setOrders(fetchedOrders);
        }
      } catch (err) {
        console.error(
          "Load orders error:",
          err
        );

        if (!cancelled) {
          setOrders([]);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your orders."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalItems = useMemo(() => {
    return orders.reduce(
      (total, order) =>
        total +
        order.items.reduce(
          (itemTotal, item) =>
            itemTotal +
            Number(item.quantity || 0),
          0
        ),
      0
    );
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">

        {/* ---------------------------------------------------------
           Header
        --------------------------------------------------------- */}

        <div className="mb-10">
          <Link
            href="/account"
            className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-[#2d2a26]"
          >
            <svg
              className="h-4 w-4"
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

          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#8b6f5a]">
            Your Shopping History
          </p>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#2d2a26] md:text-5xl">
                My Orders
              </h1>

              <p className="mt-2 text-sm text-stone-500">
                View your recent orders and order details.
              </p>
            </div>

            {orders.length > 0 && (
              <div className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-500 shadow-sm">
                {orders.length}{" "}
                {orders.length === 1
                  ? "order"
                  : "orders"}
                <span className="mx-1.5 text-stone-300">
                  ·
                </span>
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------
           Loading
        --------------------------------------------------------- */}

        {isLoading && (
          <div className="space-y-5">
            {[1, 2].map((index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm"
              >
                <div className="animate-pulse p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="h-2.5 w-20 rounded bg-stone-100" />
                      <div className="h-5 w-36 rounded bg-stone-100" />
                      <div className="h-3 w-32 rounded bg-stone-100" />
                    </div>

                    <div className="space-y-2">
                      <div className="ml-auto h-2.5 w-12 rounded bg-stone-100" />
                      <div className="ml-auto h-5 w-24 rounded bg-stone-100" />
                    </div>
                  </div>

                  <div className="mt-7 border-t border-stone-100 pt-7">
                    <div className="h-3 w-24 rounded bg-stone-100" />

                    <div className="mt-5 flex gap-4">
                      <div className="h-28 w-24 rounded-2xl bg-stone-100" />

                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-40 rounded bg-stone-100" />
                        <div className="h-3 w-24 rounded bg-stone-100" />
                        <div className="h-4 w-20 rounded bg-stone-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------
           Error
        --------------------------------------------------------- */}

        {!isLoading && error && (
          <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14a2 2 0 001.72 3h16.34a2 2 0 001.72-3l-8.18-14a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h2 className="mt-5 font-serif text-2xl font-semibold text-[#2d2a26]">
              Unable to load orders
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-full bg-[#2d2a26] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------
           Empty
        --------------------------------------------------------- */}

        {!isLoading &&
          !error &&
          orders.length === 0 && (
            <div className="rounded-3xl border border-stone-100 bg-white p-10 text-center shadow-sm md:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <svg
                  className="h-7 w-7 text-stone-400"
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

              <h2 className="mt-6 font-serif text-2xl font-semibold text-[#2d2a26]">
                No orders yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                You haven&apos;t placed any
                orders yet. Once you complete
                a purchase, your order history
                will appear here.
              </p>

              <Link
                href="/"
                className="mt-7 inline-flex rounded-full bg-[#2d2a26] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a1a1a] hover:shadow-md"
              >
                Start Shopping
              </Link>
            </div>
          )}

        {/* ---------------------------------------------------------
           Orders
        --------------------------------------------------------- */}

        {!isLoading &&
          !error &&
          orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
                >

                  {/* Order Header */}

                  <div className="p-6 sm:p-7">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b6f5a]">
                          Order Number
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <p className="break-all text-lg font-semibold tracking-tight text-[#2d2a26]">
                            {order.id}
                          </p>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${getStatusClasses(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(
                              order.status
                            )}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-stone-400">
                          {formatDateTime(
                            order.createdAt
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-6 md:justify-end">
                        <div className="md:text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                            Total
                          </p>

                          <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2d2a26]">
                            {formatCurrency(
                              order.total
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking */}

                  <OrderTracking
                    status={order.status}
                  />

                  {/* Items */}

                  <section className="border-t border-stone-100 px-5 py-7 sm:px-7">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b6f5a]">
                          Items
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          Products in this order
                        </p>
                      </div>

                      <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-semibold text-stone-500">
                        {order.items.length}{" "}
                        {order.items.length === 1
                          ? "product"
                          : "products"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={`${order.id}-${item.cartItemId}`}
                          className="group flex items-center gap-4 rounded-2xl border border-stone-100 bg-[#fcfbf9] p-3.5 transition hover:border-stone-200 hover:bg-white"
                        >
                          <ProductImage
                            image={
                              item.product.image
                            }
                            name={
                              item.product.name
                            }
                            quantity={
                              item.quantity
                            }
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#2d2a26] sm:text-base">
                              {item.product.name}
                            </p>

                            <p className="mt-1 text-xs text-stone-400">
                              Quantity:{" "}
                              {item.quantity}
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#2d2a26]">
                              {formatCurrency(
                                item.product.price *
                                  item.quantity
                              )}
                            </p>
                          </div>

                          <div className="hidden shrink-0 text-right sm:block">
                            <p className="text-[10px] uppercase tracking-[0.1em] text-stone-400">
                              Unit Price
                            </p>

                            <p className="mt-1 text-sm font-medium text-stone-600">
                              {formatCurrency(
                                item.product.price
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Summary */}

                  <section className="border-t border-stone-100 bg-[#fcfbf9] px-5 py-6 sm:px-7">
                    <div className="ml-auto max-w-md">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-stone-500">
                            Subtotal
                          </span>

                          <span className="font-medium text-[#2d2a26]">
                            {formatCurrency(
                              order.subtotal
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-stone-500">
                            Shipping
                          </span>

                          <span className="font-medium text-[#2d2a26]">
                            {order.shipping === 0
                              ? "Free"
                              : formatCurrency(
                                  order.shipping
                                )}
                          </span>
                        </div>

                        <div className="my-3 border-t border-stone-200" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#2d2a26]">
                            Total
                          </span>

                          <span className="text-xl font-semibold tracking-tight text-[#2d2a26]">
                            {formatCurrency(
                              order.total
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Footer */}

                  <footer className="flex flex-col gap-3 border-t border-stone-100 px-5 py-4 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div>
                      {order.paymentMethod && (
                        <>
                          Payment:{" "}
                          <span className="font-medium text-stone-600">
                            {
                              order.paymentMethod
                            }
                          </span>
                        </>
                      )}
                    </div>

                    <div>
                      {order.delivery ===
                      "express"
                        ? "Express Delivery"
                        : "Standard Delivery"}
                    </div>
                  </footer>
                </article>
              ))}
            </div>
          )}

        {/* ---------------------------------------------------------
           Continue Shopping
        --------------------------------------------------------- */}

        {!isLoading &&
          !error &&
          orders.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-[#2d2a26] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a1a1a] hover:shadow-md"
              >
                Continue Shopping

                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14m-6-6l6 6-6 6"
                  />
                </svg>
              </Link>
            </div>
          )}
      </div>
    </main>
  );
}
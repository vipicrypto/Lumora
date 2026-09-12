"use client";

import Image from "next/image";
import Link from "next/link";
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

const steps = [
  { key: "PENDING", label: "Order placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function dateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function dateOnly(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusIndex(status: string) {
  const index = steps.findIndex(
    (step) =>
      step.key === String(status || "PENDING").toUpperCase()
  );

  return index < 0 ? 0 : index;
}

function statusLabel(status: string) {
  return String(status || "Pending")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function safeImage(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const image = value.trim();

  if (image.startsWith("/")) {
    return image;
  }

  try {
    const url = new URL(image);

    return url.protocol === "http:" ||
      url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function Icon({
  type,
  className = "h-5 w-5",
}: {
  type:
    | "back"
    | "bag"
    | "truck"
    | "card"
    | "pin"
    | "arrow"
    | "calendar";
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "back") {
    return (
      <svg {...common}>
        <path d="m15 18-6-6 6-6" />
      </svg>
    );
  }

  if (type === "bag") {
    return (
      <svg {...common}>
        <path d="M5 8h14l1 13H4L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }

  if (type === "truck") {
    return (
      <svg {...common}>
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </svg>
    );
  }

  if (type === "card") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h4" />
      </svg>
    );
  }

  if (type === "pin") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (type === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ProductThumb({
  image,
  name,
  quantity,
}: {
  image: string;
  name: string;
  quantity: number;
}) {
  const [failed, setFailed] = useState(false);
  const src = safeImage(image);

  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:h-28 sm:w-28">
      {src && !failed ? (
        src.startsWith("/") ? (
          <Image
            src={src}
            alt={name}
            fill
            sizes="112px"
            className="object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <img
            src={src}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        )
      ) : (
        <div className="flex h-full items-center justify-center text-neutral-300">
          <Icon type="bag" className="h-7 w-7" />
        </div>
      )}

      <span className="absolute right-2 top-2 rounded-full bg-neutral-950 px-2 py-1 text-[10px] font-bold text-white">
        ×{quantity}
      </span>
    </div>
  );
}

function OrderStatus({
  status,
}: {
  status: string;
}) {
  const cancelled =
    String(status).toUpperCase() === "CANCELLED";

  const current = statusIndex(status);

  if (cancelled) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">
          Order status
        </p>

        <p className="mt-2 text-sm font-semibold text-red-800">
          Order cancelled
        </p>

        <p className="mt-1 text-xs leading-5 text-red-600">
          This order will not be delivered.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
            Delivery status
          </p>

          <p className="mt-1 text-sm font-semibold text-neutral-950">
            {steps[current]?.label}
          </p>
        </div>

        <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
          {current + 1}/5
        </span>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => {
          const complete = index <= current;
          const active = index === current;
          const last = index === steps.length - 1;

          return (
            <div
              key={step.key}
              className="relative flex gap-3.5"
            >
              {!last && (
                <div
                  className={`absolute left-[15px] top-8 h-[calc(100%-2px)] w-px ${
                    index < current
                      ? "bg-neutral-900"
                      : "bg-neutral-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  complete
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-400"
                } ${
                  active
                    ? "ring-4 ring-neutral-100"
                    : ""
                }`}
              >
                {complete ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <span className="text-[10px] font-semibold">
                    {index + 1}
                  </span>
                )}
              </div>

              <div
                className={`pb-5 pt-1 ${
                  last ? "pb-0" : ""
                }`}
              >
                <p
                  className={`text-xs font-semibold ${
                    complete
                      ? "text-neutral-950"
                      : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </p>

                {active && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                    Current stage
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/orders", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json().catch(
          () => ({})
        );

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Unable to load your orders."
          );
        }

        const nextOrders: Order[] =
          Array.isArray(data.orders)
            ? data.orders
            : [];

        nextOrders.sort((a, b) => {
          const diff =
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime();

          return (
            diff ||
            String(b.id).localeCompare(
              String(a.id)
            )
          );
        });

        if (!cancelled) {
          setOrders(nextOrders);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your orders."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => ({
      orders: orders.length,

      items: orders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce(
            (n, item) =>
              n + Number(item.quantity || 0),
            0
          ),
        0
      ),

      spent: orders.reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      ),
    }),
    [orders]
  );

  return (
    <main className="min-h-screen bg-[#f6f6f4] text-neutral-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* HEADER */}
        <header className="mb-9">
          <Link
            href="/account"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
          >
            <Icon
              type="back"
              className="h-4 w-4"
            />

            Back to Account
          </Link>

          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                Account
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                My Orders
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                Track your purchases, review order
                items and see payment and delivery
                details.
              </p>
            </div>

            {!loading &&
              !error &&
              orders.length > 0 && (
                <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="px-5 py-3.5 text-center sm:px-7">
                    <p className="text-lg font-semibold">
                      {stats.orders}
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                      Orders
                    </p>
                  </div>

                  <div className="border-l border-neutral-100 px-5 py-3.5 text-center sm:px-7">
                    <p className="text-lg font-semibold">
                      {stats.items}
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                      Items
                    </p>
                  </div>

                  <div className="border-l border-neutral-100 px-5 py-3.5 text-center sm:px-7">
                    <p className="text-lg font-semibold">
                      {money(stats.spent)}
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                      Total
                    </p>
                  </div>
                </div>
              )}
          </div>
        </header>

        {/* LOADING */}
        {loading && (
          <div className="space-y-5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[28px] border border-neutral-200 bg-white p-6 sm:p-8"
              >
                <div className="h-5 w-44 rounded bg-neutral-100" />

                <div className="mt-3 h-3 w-64 rounded bg-neutral-100" />

                <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="h-48 rounded-2xl bg-neutral-100" />

                  <div className="h-48 rounded-2xl bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <section className="rounded-[28px] border border-neutral-200 bg-white p-10 text-center sm:p-14">
            <h2 className="text-2xl font-semibold tracking-tight">
              Unable to load orders
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Try Again
            </button>
          </section>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          orders.length === 0 && (
            <section className="rounded-[28px] border border-neutral-200 bg-white p-12 text-center sm:p-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                <Icon type="bag" />
              </div>

              <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                No orders yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                You haven&apos;t placed any orders
                yet. Your order history will appear
                here after your first purchase.
              </p>

              <Link
                href="/"
                className="mt-7 inline-flex rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Start Shopping
              </Link>
            </section>
          )}

        {/* ORDERS */}
        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="space-y-7">
              {orders.map((order) => {
                const current = statusIndex(
                  order.status
                );

                const units =
                  order.items.reduce(
                    (sum, item) =>
                      sum +
                      Number(
                        item.quantity || 0
                      ),
                    0
                  );

                const cancelled =
                  String(order.status).toUpperCase() ===
                  "CANCELLED";

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
                  >
                    {/* ORDER HEADER */}
                    <div className="border-b border-neutral-100 p-5 sm:p-7 lg:p-8">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                            <Icon type="bag" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                                Order
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
                                  cancelled
                                    ? "bg-red-50 text-red-600"
                                    : "bg-neutral-100 text-neutral-600"
                                }`}
                              >
                                {statusLabel(
                                  order.status
                                )}
                              </span>
                            </div>

                            <h2 className="mt-1.5 break-all text-xl font-semibold tracking-[-0.025em]">
                              {order.id}
                            </h2>

                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-400">
                              <span className="inline-flex items-center gap-1.5">
                                <Icon
                                  type="calendar"
                                  className="h-3.5 w-3.5"
                                />

                                {dateTime(
                                  order.createdAt
                                )}
                              </span>

                              <span>
                                {units}{" "}
                                {units === 1
                                  ? "item"
                                  : "items"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-5 rounded-2xl bg-neutral-50 px-5 py-4 lg:min-w-[230px] lg:justify-end">
                          <div className="lg:text-right">
                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                              Order total
                            </p>

                            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                              {money(order.total)}
                            </p>
                          </div>

                          <Link
                            href={`/orders/${encodeURIComponent(
                              order.id
                            )}`}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
                            aria-label={`View order ${order.id}`}
                          >
                            <Icon
                              type="arrow"
                              className="h-4 w-4"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* MAIN AREA */}
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">

                      {/* PRODUCTS */}
                      <section className="p-5 sm:p-7 lg:p-8">
                        <div className="mb-5 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                              Products
                            </p>

                            <h3 className="mt-1 text-lg font-semibold">
                              Your items
                            </h3>
                          </div>

                          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                            {order.items.length}{" "}
                            {order.items.length === 1
                              ? "product"
                              : "products"}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {order.items.map(
                            (item) => (
                              <div
                                key={`${order.id}-${item.cartItemId}`}
                                className="flex gap-4 rounded-2xl border border-neutral-100 bg-[#fafafa] p-3 sm:p-4"
                              >
                                <ProductThumb
                                  image={
                                    item.product
                                      .image
                                  }
                                  name={
                                    item.product
                                      .name
                                  }
                                  quantity={
                                    item.quantity
                                  }
                                />

                                <div className="min-w-0 flex-1 py-1">
                                  <p className="truncate text-sm font-semibold sm:text-base">
                                    {
                                      item.product
                                        .name
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-neutral-400">
                                    Quantity:{" "}
                                    {
                                      item.quantity
                                    }
                                  </p>

                                  <p className="mt-3 text-sm font-semibold">
                                    {money(
                                      item.product
                                        .price *
                                        item.quantity
                                    )}
                                  </p>
                                </div>

                                <div className="hidden shrink-0 text-right sm:block">
                                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                                    Unit price
                                  </p>

                                  <p className="mt-1 text-sm font-medium">
                                    {money(
                                      item.product
                                        .price
                                    )}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </section>

                      {/* RIGHT SIDE */}
                      <aside className="border-t border-neutral-100 bg-[#f9f9f7] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
                        <OrderStatus
                          status={
                            order.status
                          }
                        />

                        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                            Payment summary
                          </p>

                          <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-neutral-500">
                                Subtotal
                              </span>

                              <span className="font-medium">
                                {money(
                                  order.subtotal
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-neutral-500">
                                Shipping
                              </span>

                              <span className="font-medium">
                                {order.shipping ===
                                0
                                  ? "Free"
                                  : money(
                                      order.shipping
                                    )}
                              </span>
                            </div>

                            <div className="border-t border-neutral-100 pt-3">
                              <div className="flex justify-between gap-4">
                                <span className="font-semibold">
                                  Total
                                </span>

                                <span className="text-lg font-semibold">
                                  {money(
                                    order.total
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </aside>
                    </div>

                    {/* META STRIP */}
                    <div className="grid border-t border-neutral-100 sm:grid-cols-3">
                      <div className="flex items-center gap-3 p-5 sm:px-7">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                          <Icon
                            type="card"
                            className="h-4 w-4"
                          />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-neutral-400">
                            Payment
                          </p>

                          <p className="mt-0.5 text-xs font-semibold">
                            {order.paymentMethod ||
                              "COD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-t border-neutral-100 p-5 sm:border-l sm:border-t-0 sm:px-7">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                          <Icon
                            type="truck"
                            className="h-4 w-4"
                          />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-neutral-400">
                            Delivery
                          </p>

                          <p className="mt-0.5 text-xs font-semibold">
                            {order.delivery ===
                            "express"
                              ? "Express delivery"
                              : "Standard delivery"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-t border-neutral-100 p-5 sm:border-l sm:border-t-0 sm:px-7">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                          <Icon
                            type="pin"
                            className="h-4 w-4"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-neutral-400">
                            Ship to
                          </p>

                          <p className="mt-0.5 truncate text-xs font-semibold">
                            {order.customer
                              .city ||
                              order.customer
                                .state ||
                              "Address available"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <footer className="flex flex-col gap-3 border-t border-neutral-100 px-5 py-4 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                      <span>
                        Placed{" "}
                        {dateOnly(
                          order.createdAt
                        )}
                      </span>

                      <Link
                        href={`/orders/${encodeURIComponent(
                          order.id
                        )}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-neutral-700 hover:text-neutral-950"
                      >
                        View full order

                        <Icon
                          type="arrow"
                          className="h-3.5 w-3.5"
                        />
                      </Link>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}

        {/* BOTTOM */}
        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Continue Shopping

                <Icon
                  type="arrow"
                  className="h-4 w-4"
                />
              </Link>
            </div>
          )}
      </div>
    </main>
  );
}
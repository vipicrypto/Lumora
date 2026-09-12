"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface Order {
  id: string;
  createdAt?: string;
  customer: {
    fullName: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  items: {
    cartItemId: string;
    product: {
      id: string;
      name: string;
      image: string;
      price: number;
    };
    quantity: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
}

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function statusClasses(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-100";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 border-blue-100";

    case "PROCESSING":
      return "bg-violet-50 text-violet-700 border-violet-100";

    case "SHIPPED":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";

    case "DELIVERED":
      return "bg-green-50 text-green-700 border-green-100";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-100";

    default:
      return "bg-stone-50 text-stone-600 border-stone-100";
  }
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | OrderStatus>(
    "ALL"
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders?admin=true", {
        method: "GET",
        cache: "no-store",
      });

      const text = await response.text();

      let data: {
        orders?: Order[];
        error?: string;
      } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Orders API returned invalid JSON (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to load admin orders.");
      }

      setOrders(data.orders ?? []);
    } catch (err) {
      console.error("Admin orders error:", err);

      setOrders([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        filterStatus === "ALL" || order.status === filterStatus;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        order.id.toLowerCase().includes(query) ||
        order.customer.fullName.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query)
      );
    });
  }, [orders, search, filterStatus]);

  const updateStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    setUpdatingId(orderId);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      const text = await response.text();

      let data: {
        order?: Partial<Order>;
        error?: string;
      } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Status update returned invalid JSON (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update order status."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );
    } catch (err) {
      console.error("Update order status error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const processingCount = orders.filter(
    (order) =>
      order.status === "CONFIRMED" ||
      order.status === "PROCESSING"
  ).length;

  const shippedCount = orders.filter(
    (order) => order.status === "SHIPPED"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <Link
              href="/admin"
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

              Admin Dashboard
            </Link>

            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8b6f5a] mb-2">
              Store Management
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-[#2d2a26]">
              Orders
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Manage customer orders and update delivery status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-[#2d2a26] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-all"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M5.1 9A7 7 0 0117.9 6.1L20 9M18.9 15A7 7 0 016.1 17.9L4 15"
              />
            </svg>

            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-[10px] uppercase tracking-wide text-stone-400">
              Total Orders
            </p>

            <p className="text-2xl font-semibold text-[#2d2a26] mt-2">
              {orders.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-[10px] uppercase tracking-wide text-stone-400">
              Pending
            </p>

            <p className="text-2xl font-semibold text-amber-600 mt-2">
              {pendingCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-[10px] uppercase tracking-wide text-stone-400">
              Processing
            </p>

            <p className="text-2xl font-semibold text-violet-600 mt-2">
              {processingCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-[10px] uppercase tracking-wide text-stone-400">
              Shipped
            </p>

            <p className="text-2xl font-semibold text-indigo-600 mt-2">
              {shippedCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-[10px] uppercase tracking-wide text-stone-400">
              Delivered
            </p>

            <p className="text-2xl font-semibold text-green-600 mt-2">
              {deliveredCount}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order ID, customer or email..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:border-[#8b6f5a] focus:ring-2 focus:ring-[#8b6f5a]/10"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(
                  event.target.value as "ALL" | OrderStatus
                )
              }
              className="md:w-52 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#2d2a26] focus:outline-none focus:border-[#8b6f5a]"
            >
              <option value="ALL">All Statuses</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-14 text-center">
            <div className="mx-auto mb-5 w-10 h-10 rounded-full border-2 border-stone-200 border-t-[#8b6f5a] animate-spin" />

            <p className="text-sm font-medium text-[#2d2a26]">
              Loading orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-14 text-center">
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
                  d="M9 5H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M9 5a2 2 0 002 2h4l5 5v6"
                />
              </svg>
            </div>

            <h2 className="text-xl font-serif font-semibold text-[#2d2a26]">
              No orders found
            </h2>

            <p className="text-sm text-stone-500 mt-2">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    {/* Order */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-semibold text-[#2d2a26]">
                          {order.id}
                        </h2>

                        <span
                          className={`px-3 py-1 rounded-full border text-[10px] font-semibold ${statusClasses(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="text-xs text-stone-400 mt-2">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="lg:min-w-52">
                      <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-1">
                        Customer
                      </p>

                      <p className="text-sm font-medium text-[#2d2a26]">
                        {order.customer.fullName}
                      </p>

                      <p className="text-xs text-stone-500 mt-1 truncate">
                        {order.customer.email}
                      </p>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-1">
                        Items
                      </p>

                      <p className="text-sm font-medium text-[#2d2a26]">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </p>
                    </div>

                    {/* Total */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-1">
                        Total
                      </p>

                      <p className="text-base font-semibold text-[#2d2a26]">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-44">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(event) =>
                          updateStatus(
                            order.id,
                            event.target.value as OrderStatus
                          )
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-[#2d2a26] focus:outline-none focus:border-[#8b6f5a] disabled:opacity-50"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-[#2d2a26] hover:bg-stone-50 transition-all"
                      >
                        View Order →
                      </Link>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="border-t border-stone-100 mt-5 pt-5">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 4).map((item) => (
                        <span
                          key={item.cartItemId}
                          className="inline-flex items-center gap-2 rounded-full bg-stone-50 border border-stone-100 px-3 py-2 text-xs text-stone-600"
                        >
                          {item.product.name}

                          <span className="text-stone-400">
                            ×{item.quantity}
                          </span>
                        </span>
                      ))}

                      {order.items.length > 4 && (
                        <span className="inline-flex items-center px-3 py-2 text-xs text-stone-400">
                          +{order.items.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

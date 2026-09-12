"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type Order = {
  id: string;
  customer: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
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
};

function statusClasses(status: OrderStatus) {
  switch (status) {
    case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100";
    case "CONFIRMED": return "bg-blue-50 text-blue-700 border-blue-100";
    case "PROCESSING": return "bg-violet-50 text-violet-700 border-violet-100";
    case "SHIPPED": return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "DELIVERED": return "bg-green-50 text-green-700 border-green-100";
    case "CANCELLED": return "bg-red-50 text-red-700 border-red-100";
  }
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = decodeURIComponent(String(params.id || ""));

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        // Fetch the admin order list and select the requested order locally.
        // This also works with the current /api/orders implementation, which
        // returns { orders: [...] } rather than a single { order: ... } object.
        const response = await fetch(
          "/api/orders?admin=true",
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load order.");
        }

        const orders = Array.isArray(data.orders) ? data.orders : [];
        const selectedOrder = orders.find(
          (candidate: Order) => String(candidate.id) === orderId
        );

        if (!selectedOrder) {
          throw new Error("Order details were not returned.");
        }

        setOrder(selectedOrder);
      } catch (err) {
        console.error("Admin order details error:", err);
        setError(err instanceof Error ? err.message : "Unable to load order.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 md:py-14">
        <Link
          href="/admin/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-[#2d2a26]"
        >
          ← Back to Orders
        </Link>

        {loading ? (
          <div className="rounded-3xl border border-stone-100 bg-white p-14 text-center shadow-sm">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-[#8b6f5a]" />
            <p className="text-sm font-medium text-[#2d2a26]">Loading order...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8">
            <h1 className="text-xl font-semibold text-red-800">Unable to load order</h1>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        ) : order ? (
          <>
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b6f5a]">
                  Order Details
                </p>
                <h1 className="font-serif text-3xl font-semibold text-[#2d2a26] md:text-4xl">
                  {order.id}
                </h1>
              </div>
              <span className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold ${statusClasses(order.status)}`}>
                {order.status}
              </span>
            </header>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
              <section className="rounded-3xl border border-stone-100 bg-white shadow-sm">
                <div className="border-b border-stone-100 p-6">
                  <h2 className="text-lg font-semibold text-[#2d2a26]">Items</h2>
                </div>

                <div className="divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <div key={item.cartItemId} className="flex gap-4 p-6">
                      <img
                        src={item.product.image || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-2xl bg-stone-50 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#2d2a26]">{item.product.name}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          {money(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-[#2d2a26]">
                        {money(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="space-y-6">
                <section className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#2d2a26]">Customer</h2>
                  <div className="mt-5 space-y-3 text-sm">
                    <p className="font-medium text-[#2d2a26]">{order.customer.fullName}</p>
                    <p className="text-stone-500">{order.customer.email}</p>
                    {order.customer.phone ? <p className="text-stone-500">{order.customer.phone}</p> : null}
                  </div>
                </section>

                <section className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#2d2a26]">Payment & Total</h2>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><span className="text-stone-500">Payment</span><span className="font-medium text-[#2d2a26]">{order.paymentMethod || "—"}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-stone-500">Subtotal</span><span>{money(order.subtotal)}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-stone-500">Shipping</span><span>{money(order.shipping)}</span></div>
                    <div className="border-t border-stone-100 pt-4 flex justify-between gap-4 text-base font-semibold"><span>Total</span><span>{money(order.total)}</span></div>
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

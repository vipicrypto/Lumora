"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  total: number;
  status: string;
  customer?: { fullName?: string; email?: string };
  items?: { quantity: number }[];
};

type Analytics = {
  summary: {
    revenue: number;
    totalOrders: number;
    activeProducts: number;
    totalProducts: number;
    customers: number;
    lowStockCount: number;
  };
  statusDistribution: { status: string; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number; category: string }[];
  categoryRevenue: { category: string; revenue: number }[];
  lowStock: { id: string; name: string; stock: number }[];
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ordersResponse, analyticsResponse] = await Promise.all([
          fetch("/api/orders?admin=true", { cache: "no-store" }),
          fetch("/api/admin/analytics", { cache: "no-store" }),
        ]);

        const ordersData = await ordersResponse.json();
        const analyticsData = await analyticsResponse.json();

        if (!ordersResponse.ok) throw new Error(ordersData.error || "Unable to load dashboard.");
        if (!analyticsResponse.ok) throw new Error(analyticsData.error || "Unable to load analytics.");

        setOrders(ordersData.orders || []);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard.");
      } finally {
        setLoading(false);
        setAnalyticsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalOrders = analytics?.summary.totalOrders ?? orders.length;
  const totalRevenue = analytics?.summary.revenue ?? orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const pendingOrders = analytics?.statusDistribution.find((item) => item.status === "PENDING")?.count ?? 0;
  const processingOrders = analytics?.statusDistribution.find((item) => item.status === "PROCESSING")?.count ?? 0;
  const shippedOrders = analytics?.statusDistribution.find((item) => item.status === "SHIPPED")?.count ?? 0;
  const deliveredOrders = analytics?.statusDistribution.find((item) => item.status === "DELIVERED")?.count ?? 0;

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">Lumora Admin</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-black">Dashboard</h1>
            <p className="mt-2 text-sm text-neutral-500">Store performance, sales analytics and order overview.</p>
          </div>
          <Link href="/" className="w-fit rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-100">Back to Store</Link>
        </div>

        {error ? <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div> : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Orders" value={loading ? "—" : totalOrders} />
          <StatCard label="Revenue" value={loading ? "—" : formatCurrency(totalRevenue)} />
          <StatCard label="Customers" value={analyticsLoading ? "—" : analytics?.summary.customers ?? 0} />
          <StatCard label="Products" value={analyticsLoading ? "—" : analytics?.summary.activeProducts ?? 0} />
          <StatCard label="Pending" value={loading ? "—" : pendingOrders} />
          <StatCard label="Low Stock" value={analyticsLoading ? "—" : analytics?.summary.lowStockCount ?? 0} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Order Status" subtitle="Current order distribution">
            <StatusChart data={analytics?.statusDistribution || []} loading={analyticsLoading} />
          </ChartCard>
          <ChartCard title="Revenue by Category" subtitle="Sales contribution from completed, active orders">
            <CategoryChart data={analytics?.categoryRevenue || []} loading={analyticsLoading} formatCurrency={formatCurrency} />
          </ChartCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Top Selling Products" subtitle="Highest revenue products">
            <TopProductsChart data={analytics?.topProducts || []} loading={analyticsLoading} formatCurrency={formatCurrency} />
          </ChartCard>
          <ChartCard title="Inventory Alerts" subtitle="Products with 5 or fewer units">
            <InventoryChart data={analytics?.lowStock || []} loading={analyticsLoading} />
          </ChartCard>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-neutral-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-black">Recent Orders</h2>
              <p className="mt-1 text-sm text-neutral-500">Latest orders placed in your store.</p>
            </div>
            <Link href="/admin/orders" className="w-fit rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800">View All Orders →</Link>
          </div>

          {loading ? <div className="p-8 text-center text-sm text-neutral-500">Loading orders...</div> : recentOrders.length === 0 ? (
            <div className="p-10 text-center"><p className="text-sm font-medium text-neutral-700">No orders yet</p><p className="mt-1 text-sm text-neutral-400">New orders will appear here.</p></div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentOrders.map((order) => {
                const customerName = order.customer?.fullName || "Guest Customer";
                const itemCount = order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
                return (
                  <div key={order.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><p className="font-medium text-black">{order.id}</p><p className="mt-1 truncate text-sm text-neutral-500">{customerName}</p></div>
                    <div className="flex items-center gap-6">
                      <div className="hidden text-right sm:block"><p className="text-xs text-neutral-400">Items</p><p className="mt-1 text-sm font-medium text-black">{itemCount}</p></div>
                      <div className="text-right"><p className="text-xs text-neutral-400">Total</p><p className="mt-1 text-sm font-semibold text-black">{formatCurrency(Number(order.total || 0))}</p></div>
                      <StatusBadge status={order.status} />
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-black underline underline-offset-4">View</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"><p className="text-sm text-neutral-500">Order Management</p><h2 className="mt-2 text-xl font-semibold text-black">Manage Orders</h2><p className="mt-2 text-sm leading-6 text-neutral-500">View customers, order items, totals and update order status from one place.</p><Link href="/admin/orders" className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800">Open Order Management →</Link></div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"><p className="text-sm text-neutral-500">Storefront</p><h2 className="mt-2 text-xl font-semibold text-black">Hero Carousel</h2><p className="mt-2 text-sm leading-6 text-neutral-500">Update the image and video slides shown on the Lumora homepage.</p><Link href="/admin/hero" className="mt-5 inline-flex rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-100">Manage Hero Slides →</Link></div>
        </section>
      </div>
    </main>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-black">{title}</h2><p className="mt-1 text-sm text-neutral-500">{subtitle}</p><div className="mt-6">{children}</div></section>;
}

function StatusChart({ data, loading }: { data: { status: string; count: number }[]; loading: boolean }) {
  if (loading) return <LoadingChart />;
  const max = Math.max(...data.map((item) => item.count), 1);
  return <div className="space-y-4">{data.map((item) => <div key={item.status}><div className="mb-1.5 flex justify-between text-xs font-medium"><span className="text-neutral-600">{prettyStatus(item.status)}</span><span className="text-black">{item.count}</span></div><div className="h-3 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-black transition-all" style={{ width: `${(item.count / max) * 100}%` }} /></div></div>)}</div>;
}

function CategoryChart({ data, loading, formatCurrency }: { data: { category: string; revenue: number }[]; loading: boolean; formatCurrency: (value: number) => string }) {
  if (loading) return <LoadingChart />;
  if (!data.length) return <EmptyChart text="No category sales yet." />;
  const max = Math.max(...data.map((item) => item.revenue), 1);
  return <div className="space-y-4">{data.map((item) => <div key={item.category}><div className="mb-1.5 flex justify-between gap-4 text-xs font-medium"><span className="truncate text-neutral-600">{item.category}</span><span className="shrink-0 text-black">{formatCurrency(item.revenue)}</span></div><div className="h-3 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-black transition-all" style={{ width: `${(item.revenue / max) * 100}%` }} /></div></div>)}</div>;
}

function TopProductsChart({ data, loading, formatCurrency }: { data: { name: string; quantity: number; revenue: number; category: string }[]; loading: boolean; formatCurrency: (value: number) => string }) {
  if (loading) return <LoadingChart />;
  if (!data.length) return <EmptyChart text="No product sales yet." />;
  const max = Math.max(...data.map((item) => item.revenue), 1);
  return <div className="space-y-4">{data.map((item, index) => <div key={`${item.name}-${index}`}><div className="mb-1.5 flex items-center justify-between gap-4 text-xs font-medium"><span className="min-w-0 truncate text-neutral-700"><span className="mr-2 text-neutral-400">#{index + 1}</span>{item.name}</span><span className="shrink-0 text-black">{formatCurrency(item.revenue)}</span></div><div className="h-3 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-black" style={{ width: `${(item.revenue / max) * 100}%` }} /></div><p className="mt-1 text-[11px] text-neutral-400">{item.quantity} unit{item.quantity === 1 ? "" : "s"} · {item.category}</p></div>)}</div>;
}

function InventoryChart({ data, loading }: { data: { id: string; name: string; stock: number }[]; loading: boolean }) {
  if (loading) return <LoadingChart />;
  if (!data.length) return <EmptyChart text="All products have more than 5 units in stock." />;
  return <div className="space-y-3">{data.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border border-neutral-100 px-4 py-3"><span className="min-w-0 truncate pr-4 text-sm font-medium text-neutral-700">{item.name}</span><span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-black">{item.stock} left</span></div>)}</div>;
}

function LoadingChart() { return <div className="space-y-4">{[1, 2, 3, 4].map((item) => <div key={item}><div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" /><div className="mt-2 h-3 animate-pulse rounded-full bg-neutral-100" /></div>)}</div>; }
function EmptyChart({ text }: { text: string }) { return <div className="rounded-2xl bg-neutral-50 p-8 text-center text-sm text-neutral-500">{text}</div>; }
function prettyStatus(status: string) { return status.charAt(0) + status.slice(1).toLowerCase(); }
function StatCard({ label, value }: { label: string; value: number | string }) { return <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><p className="text-sm text-neutral-500">{label}</p><p className="mt-3 text-2xl font-semibold tracking-tight text-black">{value}</p></div>; }
function StatusBadge({ status }: { status: string }) { return <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700">{prettyStatus(status)}</span>; }


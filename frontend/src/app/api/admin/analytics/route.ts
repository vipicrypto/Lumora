import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/prisma/db";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("lumora_user_id")?.value;
  if (!userId) return null;

  const users = await db.orm.public.User.where({ id: userId }).all();
  return users[0] ?? null;
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
    }

    const [orders, products, users, orderItems] = await Promise.all([
      db.orm.public.Order.all(),
      db.orm.public.Product.all(),
      db.orm.public.User.all(),
      db.orm.public.OrderItem.all(),
    ]);

    const activeOrders = (orders as any[]).filter((order) => order.status !== "CANCELLED");
    const revenue = activeOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    const statusNames = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    const statusDistribution = statusNames.map((status) => ({
      status,
      count: (orders as any[]).filter((order) => order.status === status).length,
    }));

    const productMap = new Map<string, any>();
    (products as any[]).forEach((product) => {
      productMap.set(product.id, product);
      productMap.set(`name:${String(product.name).toLowerCase()}`, product);
    });

    const productSales = new Map<string, { name: string; quantity: number; revenue: number; category: string }>();
    const categorySales = new Map<string, number>();

    for (const item of orderItems as any[]) {
      const order = (orders as any[]).find((candidate) => candidate.id === item.orderId);
      if (!order || order.status === "CANCELLED") continue;

      const product =
        (item.productId && productMap.get(item.productId)) ||
        productMap.get(`name:${String(item.productName).toLowerCase()}`);

      const name = String(item.productName || product?.name || "Product");
      const key = product?.id || `name:${name.toLowerCase()}`;
      const category = String(product?.category || "Uncategorized");
      const quantity = Number(item.quantity || 0);
      const itemRevenue = Number(item.totalPrice || 0);
      const existing = productSales.get(key);

      productSales.set(key, {
        name,
        quantity: (existing?.quantity || 0) + quantity,
        revenue: (existing?.revenue || 0) + itemRevenue,
        category,
      });

      categorySales.set(category, (categorySales.get(category) || 0) + itemRevenue);
    }

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const categoryRevenue = Array.from(categorySales.entries())
      .map(([category, value]) => ({ category, revenue: value }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const lowStock = (products as any[])
      .map((product) => ({ id: product.id, name: product.name, stock: Number(product.stock || 0) }))
      .filter((product) => product.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      summary: {
        revenue,
        totalOrders: orders.length,
        activeProducts: (products as any[]).filter((product) => product.isActive).length,
        totalProducts: products.length,
        customers: (users as any[]).filter((account) => account.role !== "ADMIN").length,
        lowStockCount: (products as any[]).filter((product) => Number(product.stock || 0) <= 5).length,
      },
      statusDistribution,
      topProducts,
      categoryRevenue,
      lowStock,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


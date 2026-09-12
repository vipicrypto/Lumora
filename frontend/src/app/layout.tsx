import type { Metadata } from "next";

import "./globals.css";

import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import AppShell from "./AppShell";
import { db } from "@/prisma/db";

export const metadata: Metadata = {
  title: "Lumora — Thoughtful Gifts",
  description: "Curated gifts for every person, every occasion.",
};

async function getInitialCategories() {
  try {
    const allCategories = await db.orm.public.Category.all();

    return allCategories
      .filter((category) => category.isActive)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((category) => ({
        name: category.name,
        href: `/products?category=${encodeURIComponent(category.slug)}`,
      }));
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialCategories = await getInitialCategories();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#faf9f7] text-[#1a1a1a] font-sans">
        <CartProvider>
          <WishlistProvider>
            <AppShell initialCategories={initialCategories}>
              {children}
            </AppShell>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

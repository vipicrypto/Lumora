"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch("/api/logout", {
        method: "POST",
      });

      window.dispatchEvent(
        new Event("lumora-auth-changed"),
      );

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Admin logout error:",
        error,
      );

      setLoggingOut(false);
    }
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: "▦",
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: "□",
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: "◇",
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: "○",
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: "♙",
    },
    {
      label: "Hero Slides",
      href: "/admin/hero",
      icon: "▤",
    },
    {
      label: "Home Sections",
      href: "/admin/home-sections",
      icon: "▥",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-neutral-200 px-6 py-6">
            <Link
              href="/admin"
              className="block"
            >
              <div className="text-xl font-semibold tracking-tight text-black">
                LUMORA
              </div>

              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                Admin Panel
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Management
            </p>

            <div className="space-y-1">
              {navItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(
                        item.href,
                      );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-black text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center text-sm">
                      {item.icon}
                    </span>

                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-neutral-200 p-4">
            <Link
              href="/"
              className="mb-2 flex items-center rounded-xl px-3 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
            >
              View Store →
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-neutral-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {loggingOut
                ? "Signing out..."
                : "Sign out"}
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-5 sm:px-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Lumora
                </p>

                <p className="text-sm font-semibold text-black">
                  Admin Dashboard
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="hidden rounded-lg border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black sm:block"
                >
                  View Store
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {loggingOut
                    ? "..."
                    : "Logout"}
                </button>
              </div>
            </div>
          </header>

          {/* Mobile navigation */}
          <div className="border-b border-neutral-200 bg-white px-5 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto">
              {navItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(
                        item.href,
                      );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium transition ${
                      active
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
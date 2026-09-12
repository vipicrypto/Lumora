"use client";

import { usePathname } from "next/navigation";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

type NavLink = {
  name: string;
  href: string;
};

export default function AppShell({
  children,
  initialCategories = [],
}: {
  children: React.ReactNode;
  initialCategories?: NavLink[];
}) {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header initialCategories={initialCategories} />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">
        {children}
      </main>

      <Footer />
    </>
  );
}

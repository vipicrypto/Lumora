import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/prisma/db";
import AdminLayoutClient from "@/app/admin/AdminLayoutClient";
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const userId =
    cookieStore.get("lumora_user_id")?.value;

  if (!userId) {
    redirect("/login");
  }

  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
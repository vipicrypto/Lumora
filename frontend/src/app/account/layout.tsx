import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/prisma/db";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("lumora_user_id")?.value;

  if (!userId) {
    redirect("/login?redirect=/account");
  }

  const users = await db.orm.public.User
    .where({
      id: userId,
    })
    .all();

  const user = users[0];

  if (!user) {
    redirect("/login?redirect=/account");
  }

  return children;
}
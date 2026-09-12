import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/prisma/db";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const userId = cookieStore.get("lumora_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Please sign in.",
        },
        { status: 401 },
      );
    }

    const currentUser = await db.orm.public.User
      .where({ id: userId })
      .first();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 401 },
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        { status: 403 },
      );
    }

    const users = await db.orm.public.User.all();
    const orders = await db.orm.public.Order.all();

    const orderCountByUser = new Map<string, number>();

    for (const order of orders) {
      if (!order.userId) {
        continue;
      }

      const id = String(order.userId);

      orderCountByUser.set(
        id,
        (orderCountByUser.get(id) ?? 0) + 1,
      );
    }

    const formattedUsers = users
      .map((user) => ({
        id: String(user.id),
        name: user.name ? String(user.name) : null,
        email: String(user.email),
        role: String(user.role),
        ordersCount:
          orderCountByUser.get(String(user.id)) ?? 0,
      }))
      .sort((a, b) =>
        a.email.localeCompare(b.email),
      );

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load users.",
      },
      { status: 500 },
    );
  }
}
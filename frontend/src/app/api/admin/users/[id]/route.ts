import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/prisma/db";

async function getCurrentAdmin() {
  const cookieStore = await cookies();

  const currentUserId =
    cookieStore.get("lumora_user_id")?.value;

  if (!currentUserId) {
    return null;
  }

  const currentUser = await db.orm.public.User
    .where({ id: currentUserId })
    .first();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return null;
  }

  return currentUser;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    const user = await db.orm.public.User
      .where({ id })
      .first();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 },
      );
    }

    const orders = await db.orm.public.Order
      .where({ userId: id })
      .all();

    return NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.name
          ? String(user.name)
          : null,
        email: String(user.email),
        role: String(user.role),
        ordersCount: orders.length,
        orders: orders.map((order) => ({
          id: String(order.id),
          status: String(order.status),
          total: Number(order.total) || 0,
        })),
      },
    });
  } catch (error) {
    console.error(
      "Admin user details error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load user details.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (String(id) === String(currentAdmin.id)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot change your own admin role.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const requestedRole = String(
      body.role || "",
    )
      .trim()
      .toUpperCase();

    if (
      requestedRole !== "ADMIN" &&
      requestedRole !== "CUSTOMER"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role.",
        },
        { status: 400 },
      );
    }

    const user = await db.orm.public.User
      .where({ id })
      .first();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 },
      );
    }

    if (
      String(user.role) === requestedRole
    ) {
      return NextResponse.json({
        success: true,
        user: {
          id: String(user.id),
          role: String(user.role),
        },
      });
    }

    if (
      String(user.role) === "ADMIN" &&
      requestedRole === "CUSTOMER"
    ) {
      const allUsers =
        await db.orm.public.User.all();

      const adminCount = allUsers.filter(
        (item) => item.role === "ADMIN",
      ).length;

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error:
              "You cannot remove the last administrator.",
          },
          { status: 400 },
        );
      }
    }

    await db.orm.public.User
      .where({ id })
      .updateAll({
        role: requestedRole as "ADMIN" | "CUSTOMER",
      });

    return NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        role: requestedRole,
      },
    });
  } catch (error) {
    console.error(
      "Admin user role update error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update user role.",
      },
      { status: 500 },
    );
  }
}
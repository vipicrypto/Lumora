import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function POST() {
  try {
    const email = "admin@lumora.com";

    const user = await db.orm.public.User
      .where({ email })
      .first();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin account not found.",
        },
        { status: 404 }
      );
    }

    const updated = await db.orm.public.User
      .where({
        id: user.id,
      })
      .updateAll({
        role: "ADMIN",
      });

    return NextResponse.json({
      success: true,
      message: "Admin role updated successfully.",
      email: user.email,
      role: "ADMIN",
      updated,
    });
  } catch (error) {
    console.error("Promote admin error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

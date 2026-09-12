import { NextResponse } from "next/server";

import { db } from "@/prisma/db";

/**
 * GET /api/categories
 *
 * Returns all active categories for public use.
 * Used by the header navigation to display admin-managed categories.
 */
export async function GET() {
  try {
    const allCategories = await db.orm.public.Category.all();

    const categories = allCategories
      .filter((category) => category.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      categories: categories.map((category) => ({
        name: category.name,
        slug: category.slug,
      })),
    });
  } catch (error) {
    console.error("Public categories GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load categories.",
      },
      { status: 500 }
    );
  }
}

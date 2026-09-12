import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Temporal } from "@js-temporal/polyfill";

import { db } from "@/prisma/db";

// Prisma's timestamptz-temporal codec expects a global Temporal implementation.
(globalThis as any).Temporal ??= Temporal;

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("lumora_user_id")?.value;

  if (!userId) {
    return null;
  }

  return await db.orm.public.User
    .where({ id: userId })
    .first();
}

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/admin/categories
 *
 * Returns all categories.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please sign in.",
        },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const categories =
      await db.orm.public.Category.all();

    return NextResponse.json({
      success: true,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        isActive: category.isActive,
        createdAt: category.createdAt.toString(),
        updatedAt: category.updatedAt.toString(),
      })),
    });
  } catch (error) {
    console.error(
      "Admin categories GET error:",
      error
    );

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

/**
 * POST /api/admin/categories
 *
 * Creates a new category.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please sign in.",
        },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Category name must be at least 2 characters.",
        },
        { status: 400 }
      );
    }

    const slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to create a valid category slug.",
        },
        { status: 400 }
      );
    }

    const existingName =
      await db.orm.public.Category
        .where({ name })
        .first();

    if (existingName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A category with this name already exists.",
        },
        { status: 409 }
      );
    }

    const existingSlug =
      await db.orm.public.Category
        .where({ slug })
        .first();

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const now =
      Temporal.Instant.fromEpochMilliseconds(
        Date.now()
      );

    const category =
      await db.orm.public.Category.create({
        id: crypto.randomUUID(),
        name,
        slug,
        description: description || null,
        image: image || null,
        isActive,
        updatedAt: now,
      });

    return NextResponse.json(
      {
        success: true,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          isActive: category.isActive,
          createdAt: category.createdAt.toString(),
          updatedAt: category.updatedAt.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin categories POST error:",
      error
    );

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

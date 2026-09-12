import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Temporal } from "@js-temporal/polyfill";

import { db } from "@/prisma/db";

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
 * PATCH /api/admin/categories/[id]
 *
 * Updates a category.
 */
export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    const existingCategory =
      await db.orm.public.Category
        .where({ id })
        .first();

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updates: {
      name?: string;
      slug?: string;
      description?: string | null;
      image?: string | null;
      isActive?: boolean;
      updatedAt?: Temporal.Instant;
    } = {};

    if (body.name !== undefined) {
      const name =
        typeof body.name === "string"
          ? body.name.trim()
          : "";

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

      const duplicateName =
        await db.orm.public.Category
          .where({ name })
          .first();

      if (
        duplicateName &&
        duplicateName.id !== id
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A category with this name already exists.",
          },
          { status: 409 }
        );
      }

      const duplicateSlug =
        await db.orm.public.Category
          .where({ slug })
          .first();

      if (
        duplicateSlug &&
        duplicateSlug.id !== id
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A category with this slug already exists.",
          },
          { status: 409 }
        );
      }

      updates.name = name;
      updates.slug = slug;
    }

    if (body.description !== undefined) {
      updates.description =
        typeof body.description === "string" &&
        body.description.trim()
          ? body.description.trim()
          : null;
    }

    if (body.image !== undefined) {
      updates.image =
        typeof body.image === "string" &&
        body.image.trim()
          ? body.image.trim()
          : null;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            error:
              "isActive must be a boolean.",
          },
          { status: 400 }
        );
      }

      updates.isActive = body.isActive;
    }

    updates.updatedAt =
      Temporal.Instant.fromEpochMilliseconds(
        Date.now()
      );

    await db.orm.public.Category
      .where({ id })
      .updateAll(updates);

    const category =
      await db.orm.public.Category
        .where({ id })
        .first();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Category could not be loaded after update.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error(
      "Admin category PATCH error:",
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
 * DELETE /api/admin/categories/[id]
 *
 * Deletes a category if no products are using it.
 */
export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    const category =
      await db.orm.public.Category
        .where({ id })
        .first();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found.",
        },
        { status: 404 }
      );
    }

    const products =
      await db.orm.public.Product
        .where({ categoryId: id })
        .all();

    if (products.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This category cannot be deleted because products are using it. Move those products to another category first.",
        },
        { status: 409 }
      );
    }

    await db.orm.public.Category
      .where({ id })
      .deleteAll();

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin category DELETE error:",
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
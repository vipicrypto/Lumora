import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/prisma/db";

function getProductImages(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      );
    }
  } catch {
    // Legacy products store a single URL as plain text.
  }

  return value.trim() ? [value.trim()] : [];
}

function getPrimaryImage(value: string | null | undefined): string {
  return getProductImages(value)[0] || "";
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("lumora_user_id")?.value;

  if (!userId) {
    return null;
  }

  return await db.orm.public.User
    .where({
      id: userId,
    })
    .first();
}

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

    const products = await db.orm.public.Product.all();

    return NextResponse.json({
      success: true,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        image: getPrimaryImage(product.image),
        images: getProductImages(product.image),
        isNew: product.isNew,
        isActive: product.isActive,
        stock: product.stock,
        youtubeVideo: product.youtubeVideo ?? null,
        recipient: product.recipient ?? null,
        occasion: product.occasion ?? null,
        materials: product.materials ?? null,
        shipping: product.shipping ?? null,
        returns: product.returns ?? null,
      })),
    });
  } catch (error) {
    console.error("Admin products GET error:", error);

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

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const recipient =
      typeof body.recipient === "string"
        ? body.recipient.trim()
        : "";

    const occasion =
      typeof body.occasion === "string"
        ? body.occasion.trim()
        : "";

    const submittedImages = Array.isArray(body.images)
      ? body.images
          .filter(
            (value: unknown): value is string =>
              typeof value === "string" &&
              value.trim().length > 0
          )
          .map((value: string) => value.trim())
      : [];

    const image =
      submittedImages[0] ||
      (typeof body.image === "string"
        ? body.image.trim()
        : "");

    const storedImage =
      submittedImages.length > 0
        ? JSON.stringify(submittedImages)
        : image;

    const price = Number(body.price);
    const stock = Number(body.stock);

    const isNew =
      typeof body.isNew === "boolean"
        ? body.isNew
        : false;

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    const youtubeVideo =
      typeof body.youtubeVideo === "string"
        ? body.youtubeVideo.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Product category is required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid product price.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(stock) ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock must be a valid whole number.",
        },
        { status: 400 }
      );
    }

    /*
     * Make sure the selected category actually exists
     * and is active.
     */
    const selectedCategory =
      await db.orm.public.Category
        .where({
          name: category,
        })
        .first();

    if (!selectedCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    if (!selectedCategory.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected category is inactive.",
        },
        { status: 400 }
      );
    }

    const product =
      await db.orm.public.Product.create({
        id: crypto.randomUUID(),
        name,
        description,
        price: price.toString(),
        category,
        categoryId: selectedCategory.id,
        recipient: recipient || null,
        occasion: occasion || null,
        image: storedImage,
        isNew,
        isActive,
        stock,
        youtubeVideo: youtubeVideo || null,
      });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          category: product.category,
          categoryId: product.categoryId,
          recipient: product.recipient ?? null,
          occasion: product.occasion ?? null,
          image: getPrimaryImage(product.image),
          images: getProductImages(product.image),
          isNew: product.isNew,
          isActive: product.isActive,
          stock: product.stock,
          youtubeVideo: product.youtubeVideo ?? null,
          materials: product.materials ?? null,
          shipping: product.shipping ?? null,
          returns: product.returns ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin products POST error:", error);

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

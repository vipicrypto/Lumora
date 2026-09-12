import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

    const products =
      await db.orm.public.Product.all();

    return NextResponse.json({
      success: true,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        image: product.image,
        isNew: product.isNew,
        isActive: product.isActive,
        stock: product.stock,
      })),
    });
  } catch (error) {
    console.error(
      "Admin products GET error:",
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

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const price = Number(body.price);
    const stock = Number(body.stock);

    const isNew =
      body.isNew === true;

    const isActive =
      body.isActive !== false;

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
          error: "Category is required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid price.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Stock must be a whole number greater than or equal to 0.",
        },
        { status: 400 }
      );
    }

    const product =
      await db.orm.public.Product.create({
        id: crypto.randomUUID(),
        name,
        description,
        price: String(price),
        category,
        image,
        isNew,
        isActive,
        stock,
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
          image: product.image,
          isNew: product.isNew,
          isActive: product.isActive,
          stock: product.stock,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin products POST error:",
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

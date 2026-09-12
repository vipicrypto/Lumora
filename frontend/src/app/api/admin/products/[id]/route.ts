import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/prisma/db";

function getProductImages(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {}
  return value.trim() ? [value.trim()] : [];
}

function getPrimaryImage(value: string | null | undefined): string {
  return getProductImages(value)[0] || "";
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("lumora_user_id")?.value;
  if (!userId) return null;
  return await db.orm.public.User.where({ id: userId }).first();
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    const existingProduct = await db.orm.public.Product.where({ id }).first();
    if (!existingProduct) return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) return NextResponse.json({ success: false, error: "Product name is required." }, { status: 400 });
      updates.name = name;
    }
    if (body.description !== undefined) updates.description = typeof body.description === "string" ? body.description.trim() : "";
    if (body.category !== undefined) {
      const category = typeof body.category === "string" ? body.category.trim() : "";
      if (category) {
        const selectedCategory = await db.orm.public.Category.where({ name: category }).first();
        if (!selectedCategory) return NextResponse.json({ success: false, error: "Selected category does not exist." }, { status: 400 });
        if (!selectedCategory.isActive) return NextResponse.json({ success: false, error: "Selected category is inactive." }, { status: 400 });
        updates.category = category;
        updates.categoryId = selectedCategory.id;
      }
    }
    if (body.image !== undefined) updates.image = typeof body.image === "string" ? body.image.trim() : "";
    if (body.images !== undefined) {
      const submittedImages = Array.isArray(body.images) ? body.images.filter((v: unknown) => typeof v === "string") as string[] : [];
      updates.image = JSON.stringify(submittedImages.map(u => u.trim()).filter(u => u.length > 0));
    }
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) return NextResponse.json({ success: false, error: "Please enter a valid product price." }, { status: 400 });
      updates.price = price.toString();
    }
    if (body.isNew !== undefined) updates.isNew = typeof body.isNew === "boolean" ? body.isNew : false;
    if (body.isActive !== undefined) updates.isActive = typeof body.isActive === "boolean" ? body.isActive : true;
    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) return NextResponse.json({ success: false, error: "Stock must be a valid whole number." }, { status: 400 });
      updates.stock = stock;
    }
    if (body.youtubeVideo !== undefined) updates.youtubeVideo = typeof body.youtubeVideo === "string" ? body.youtubeVideo.trim() || null : null;
    if (body.materials !== undefined) updates.materials = typeof body.materials === "string" ? body.materials.trim() || null : null;
    if (body.shipping !== undefined) updates.shipping = typeof body.shipping === "string" ? body.shipping.trim() || null : null;
    if (body.returns !== undefined) updates.returns = typeof body.returns === "string" ? body.returns.trim() || null : null;
    await db.orm.public.Product.where({ id }).updateAll(updates);
    const product = await db.orm.public.Product.where({ id }).first();
    if (!product) return NextResponse.json({ success: false, error: "Product could not be loaded after update." }, { status: 500 });
    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        categoryId: product.categoryId,
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
    });
  } catch (error) {
    console.error("Admin product PATCH error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    const product = await db.orm.public.Product.where({ id }).first();
    if (!product) return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    await db.orm.public.Product.where({ id }).deleteAll();
    return NextResponse.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
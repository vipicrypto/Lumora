import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

import { db } from "@/prisma/db";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;
const allowedTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("lumora_user_id")?.value;
  if (!userId) return null;
  return await db.orm.public.User.where({ id: userId }).first();
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);

    if (!files.length) {
      return NextResponse.json({ success: false, error: "Please select at least one image." }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ success: false, error: `You can upload up to ${MAX_FILES} images at a time.` }, { status: 400 });
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDirectory, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const extension = allowedTypes[file.type];
      if (!extension) {
        return NextResponse.json({ success: false, error: "Only JPG, PNG, WEBP and GIF images are allowed." }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: `Image "${file.name}" is larger than 5 MB.` }, { status: 400 });
      }

      const filename = `${crypto.randomUUID()}${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDirectory, filename), buffer);
      urls.push(`/uploads/products/${filename}`);
    }

    return NextResponse.json({ success: true, urls });
  } catch (error) {
    console.error("Admin product image upload error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}


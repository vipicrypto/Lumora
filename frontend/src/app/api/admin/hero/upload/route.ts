import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

import { db } from "@/prisma/db";

// Allow both images and videos
const allowedImageTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const allowedVideoTypes: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogg",
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB for videos

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
      return NextResponse.json(
        { success: false, error: "Please sign in." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Please select a file to upload." },
        { status: 400 }
      );
    }

    // Check if it's an image or video
    const isImage = Object.keys(allowedImageTypes).includes(file.type);
    const isVideo = Object.keys(allowedVideoTypes).includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only JPG, PNG, WEBP, GIF images and MP4, WEBM, OGG videos are allowed.",
        },
        { status: 400 }
      );
    }

    // Determine max size based on type
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          success: false,
          error: `File "${file.name}" is larger than ${maxSizeMB} MB.`,
        },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "hero"
    );
    await mkdir(uploadDirectory, { recursive: true });

    // Determine extension based on MIME type
    const extension = isImage
      ? allowedImageTypes[file.type]
      : allowedVideoTypes[file.type];

    // Generate collision-safe filename
    const filename = `${crypto.randomUUID()}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDirectory, filename), buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/hero/${filename}`,
    });
  } catch (error) {
    console.error("Admin hero upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

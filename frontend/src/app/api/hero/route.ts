import { NextResponse } from "next/server";

import { db } from "@/prisma/db";

/**
 * Customer-facing hero carousel endpoint.
 *
 * Returns active slides sorted by sortOrder. Used by the homepage
 * HeroCarousel component.
 */
export async function GET() {
  try {
    const slides = await db.orm.public.HeroSlide.all();

    const active = slides
      .filter((slide) => slide.isActive)
      .sort((a, b) => {
        const orderDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return String(a.createdAt)
          .localeCompare(String(b.createdAt));
      });

    return NextResponse.json({
      success: true,
      slides: active.map((slide) => ({
        id: slide.id,
        title: slide.title,
        description: slide.description ?? null,
        mediaType: slide.mediaType,
        mediaUrl: slide.mediaUrl,
        buttonText: slide.buttonText ?? null,
        buttonLink: slide.buttonLink ?? null,
        sortOrder: Number(slide.sortOrder || 0),
        isActive: slide.isActive,
        animation: slide.animation ?? "fade",
        animationDuration: Number(slide.animationDuration || 600),
      })),
    });
  } catch (error) {
    console.error("Public hero GET error:", error);
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

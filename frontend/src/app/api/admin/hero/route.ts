import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Temporal } from "@js-temporal/polyfill";
import { db } from "@/prisma/db";

(globalThis as any).Temporal ??= Temporal;

const VALID_MEDIA_TYPES = new Set(["IMAGE", "VIDEO"]);
const VALID_ANIMATIONS = new Set(["none", "fade", "slide-left", "slide-right", "zoom"]);
const ANIMATION_DURATION_MIN = 100;
const ANIMATION_DURATION_MAX = 5000;

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("lumora_user_id")?.value;
  if (!userId) return null;
  return await db.orm.public.User.where({ id: userId }).first();
}

function normalizeMediaType(value: unknown): "IMAGE" | "VIDEO" | null {
  if (typeof value !== "string") return null;
  const upper = value.trim().toUpperCase();
  if (VALID_MEDIA_TYPES.has(upper)) return upper as "IMAGE" | "VIDEO";
  return null;
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseSortOrder(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.trunc(numeric);
}

function normalizeAnimation(value: unknown): string {
  if (typeof value !== "string") return "fade";
  const normalized = value.trim().toLowerCase();
  return VALID_ANIMATIONS.has(normalized) ? normalized : "fade";
}

function parseAnimationDuration(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 600;
  const clamped = Math.max(ANIMATION_DURATION_MIN, Math.min(ANIMATION_DURATION_MAX, numeric));
  return Math.round(clamped);
}

function serializeSlide(slide: {
  id: string;
  title: string;
  description: string | null;
  mediaType: string;
  mediaUrl: string;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number | null;
  isActive: boolean;
  animation: string | null;
  animationDuration: number | null;
  createdAt: { toString(): string };
  updatedAt: { toString(): string };
}) {
  return {
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
    createdAt: slide.createdAt.toString(),
    updatedAt: slide.updatedAt.toString(),
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
    const slides = await db.orm.public.HeroSlide.all();
    const ordered = [...slides].sort((a, b) => {
      const orderDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      if (orderDiff !== 0) return orderDiff;
      return String(a.createdAt).localeCompare(String(b.createdAt));
    });
    return NextResponse.json({ success: true, slides: ordered.map(serializeSlide) });
  } catch (error) {
    console.error("Admin hero GET error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
    const body = await request.json();
    const title = normalizeOptionalString(body.title);
    if (!title) return NextResponse.json({ success: false, error: "Slide title is required." }, { status: 400 });
    const mediaType = normalizeMediaType(body.mediaType);
    if (!mediaType) return NextResponse.json({ success: false, error: "Media type must be IMAGE or VIDEO." }, { status: 400 });
    const mediaUrl = normalizeOptionalString(body.mediaUrl);
    if (!mediaUrl) return NextResponse.json({ success: false, error: "Slide media URL is required. Upload a file or enter an external URL." }, { status: 400 });
    const animation = normalizeAnimation(body.animation);
    const animationDuration = parseAnimationDuration(body.animationDuration);
    const newSlide = await db.orm.public.HeroSlide.create({
      id: crypto.randomUUID(),
      title,
      description: normalizeOptionalString(body.description),
      mediaType,
      mediaUrl,
      buttonText: normalizeOptionalString(body.buttonText),
      buttonLink: normalizeOptionalString(body.buttonLink),
      sortOrder: parseSortOrder(body.sortOrder),
      isActive: Boolean(body.isActive),
      animation,
      animationDuration,
      createdAt: Temporal.Instant.fromEpochMilliseconds(Date.now()),
      updatedAt: Temporal.Instant.fromEpochMilliseconds(Date.now()),
    });
    return NextResponse.json({ success: true, slide: serializeSlide(newSlide) });
  } catch (error) {
    console.error("Admin hero POST error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) return NextResponse.json({ success: false, error: "Slide id is required." }, { status: 400 });
    const existing = await db.orm.public.HeroSlide.where({ id }).first();
    if (!existing) return NextResponse.json({ success: false, error: "Slide not found." }, { status: 404 });
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) {
      const title = normalizeOptionalString(body.title);
      if (!title) return NextResponse.json({ success: false, error: "Slide title is required." }, { status: 400 });
      updates.title = title;
    }
    if (body.description !== undefined) updates.description = normalizeOptionalString(body.description);
    if (body.mediaType !== undefined) {
      const mediaType = normalizeMediaType(body.mediaType);
      if (!mediaType) return NextResponse.json({ success: false, error: "Media type must be IMAGE or VIDEO." }, { status: 400 });
      updates.mediaType = mediaType;
    }
    if (body.mediaUrl !== undefined) {
      const mediaUrl = normalizeOptionalString(body.mediaUrl);
      if (!mediaUrl && !existing.mediaUrl) return NextResponse.json({ success: false, error: "Slide media URL is required. Upload a file or enter an external URL." }, { status: 400 });
      if (mediaUrl) updates.mediaUrl = mediaUrl;
    }
    if (body.buttonText !== undefined) updates.buttonText = normalizeOptionalString(body.buttonText);
    if (body.buttonLink !== undefined) updates.buttonLink = normalizeOptionalString(body.buttonLink);
    if (body.sortOrder !== undefined) updates.sortOrder = parseSortOrder(body.sortOrder);
    if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);
    if (body.animation !== undefined) updates.animation = normalizeAnimation(body.animation);
    if (body.animationDuration !== undefined) updates.animationDuration = parseAnimationDuration(body.animationDuration);
    updates.updatedAt = Temporal.Instant.fromEpochMilliseconds(Date.now());
    await db.orm.public.HeroSlide.where({ id }).updateAll(updates);
    const updated = await db.orm.public.HeroSlide.where({ id }).first();
    if (!updated) return NextResponse.json({ success: false, error: "Slide could not be loaded after update." }, { status: 500 });
    return NextResponse.json({ success: true, slide: serializeSlide(updated) });
  } catch (error) {
    console.error("Admin hero PATCH error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) return NextResponse.json({ success: false, error: "Slide id is required." }, { status: 400 });
    const existing = await db.orm.public.HeroSlide.where({ id }).first();
    if (!existing) return NextResponse.json({ success: false, error: "Slide not found." }, { status: 404 });
    await db.orm.public.HeroSlide.where({ id }).deleteAll();
    return NextResponse.json({ success: true, message: "Slide deleted successfully." });
  } catch (error) {
    console.error("Admin hero DELETE error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}


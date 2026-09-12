import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Temporal } from "@js-temporal/polyfill";

import { db } from "@/prisma/db";

function isValidRating(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function sanitizeComment(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, 4000);
  return trimmed.length > 0 ? trimmed : null;
}

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("lumora_user_id")?.value || null;
}

function nowIso(): string {
  return new Date().toISOString();
}

// Review.updatedAt is typed as pg/timestamptz-temporal@1, whose codec
// encodes/decodes Temporal.Instant values. The previous code passed the ISO
// string from nowIso() into Review.updateAll({ updatedAt }), which the runtime
// codec rejects. Convert to a Temporal.Instant before handing it to the ORM.
function nowInstant(): Temporal.Instant {
  return Temporal.Instant.from(nowIso());
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: "Please sign in." },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Review ID is required." },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Review
      .where({ id: reviewId })
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Review not found." },
        { status: 404 }
      );
    }

    if (existing.userId !== currentUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only edit your own reviews.",
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const updates: {
      rating?: number;
      comment?: string | null;
      updatedAt: Temporal.Instant;
    } = { updatedAt: nowInstant() };

    if (body.rating !== undefined) {
      if (!isValidRating(body.rating)) {
        return NextResponse.json(
          {
            success: false,
            error: "Please choose a rating between 1 and 5 stars.",
          },
          { status: 400 }
        );
      }
      updates.rating = body.rating;
    }

    if (body.comment !== undefined) {
      updates.comment = sanitizeComment(body.comment);
    }

    await db.orm.public.Review
      .where({ id: reviewId })
      .updateAll(updates);

    const updated = await db.orm.public.Review
      .where({ id: reviewId })
      .first();

    return NextResponse.json({
      success: true,
      message: "Review updated.",
      review: {
        id: updated!.id,
        rating: Number(updated!.rating),
        comment: updated!.comment ?? null,
        createdAt: String(updated!.createdAt),
        updatedAt: String(updated!.updatedAt),
      },
    });
  } catch (error) {
    console.error("Review PATCH error:", error);
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: "Please sign in." },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Review ID is required." },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Review
      .where({ id: reviewId })
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Review not found." },
        { status: 404 }
      );
    }

    if (existing.userId !== currentUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only delete your own reviews.",
        },
        { status: 403 }
      );
    }

    await db.orm.public.Review
      .where({ id: reviewId })
      .deleteAll();

    return NextResponse.json({
      success: true,
      message: "Review deleted.",
    });
  } catch (error) {
    console.error("Review DELETE error:", error);
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


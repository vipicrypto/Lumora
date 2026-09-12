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

function sanitizeComment(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 4000);
}

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("lumora_user_id")?.value || null;
}

async function productExists(productId: string): Promise<boolean> {
  const product = await db.orm.public.Product
    .where({ id: productId })
    .first();
  return Boolean(product && product.isActive);
}

function nowIso(): string {
  return new Date().toISOString();
}

// Review.createdAt / updatedAt are typed as pg/timestamptz-temporal@1, whose
// codec encodes/decodes Temporal.Instant values. The previous code passed the
// ISO string from nowIso() directly into Review.create({ createdAt, updatedAt }),
// which the runtime codec rejects ("encodes a Temporal.Instant, but received a
// string"). Convert the ISO string (always Z-suffixed via Date.toISOString) to
// a Temporal.Instant before handing it to the ORM.
function nowInstant(): Temporal.Instant {
  return Temporal.Instant.from(nowIso());
}

// An order is considered a "valid purchase" when its status is one of these
// stages. PENDING is excluded (an unfinished checkout is not a purchase),
// and CANCELLED is excluded by requirement. Anything that is past PENDING
// (CONFIRMED, PROCESSING, SHIPPED, DELIVERED) counts as a real purchase.
const VERIFIED_ORDER_STATUSES: ReadonlySet<string> = new Set([
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
]);

function isVerifiedOrderStatus(status: string): boolean {
  return VERIFIED_ORDER_STATUSES.has(status);
}

// Returns a Map<userId, Set<productId>> of every product the user has
// actually purchased (i.e. appears in an OrderItem of a non-cancelled,
// past-PENDING order).
function computeVerifiedProductsByUser(
  orders: { id: string, userId: string | null, status: string }[],
  items: { orderId: string, productId: string | null }[]
): Map<string, Set<string>> {
  const verifiedOrderIds = new Set(
    orders
      .filter(
        (order) =>
          order.userId &&
          isVerifiedOrderStatus(String(order.status))
      )
      .map((order) => String(order.id))
  );

  const result = new Map<string, Set<string>>();

  for (const item of items) {
    if (!verifiedOrderIds.has(String(item.orderId))) continue;
    if (item.productId == null) continue;

    const owner = orders.find(
      (order) => String(order.id) === String(item.orderId)
    );
    if (!owner || !owner.userId) continue;

    const userId = String(owner.userId);
    const productId = String(item.productId);

    let set = result.get(userId);
    if (!set) {
      set = new Set<string>();
      result.set(userId, set);
    }
    set.add(productId);
  }

  return result;
}

async function buildReviewsPayload(productId: string) {
  const allReviews = await db.orm.public.Review.all();
  const reviewsForProduct = allReviews
    .filter((review) => review.productId === productId)
    .sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );

  const reviewCount = reviewsForProduct.length;
  const averageRating =
    reviewCount > 0
      ? reviewsForProduct.reduce(
          (sum, review) => sum + Number(review.rating),
          0
        ) / reviewCount
      : 0;

  const allUsers = await db.orm.public.User.all();
  const userById = new Map(
    allUsers.map((candidate) => [candidate.id, candidate])
  );

  const allOrders = await db.orm.public.Order.all();
  const allOrderItems = await db.orm.public.OrderItem.all();

  const verifiedByUser = computeVerifiedProductsByUser(
    allOrders,
    allOrderItems
  );

  const currentUserId = await getCurrentUserId();

  let verifiedPurchase = false;
  let currentUserReview: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
    verifiedPurchase: boolean;
  } | null = null;

  if (currentUserId) {
    verifiedPurchase = Boolean(
      verifiedByUser.get(currentUserId)?.has(productId)
    );

    const own = reviewsForProduct.find(
      (review) => review.userId === currentUserId
    );
    if (own) {
      currentUserReview = {
        id: own.id,
        rating: Number(own.rating),
        comment: own.comment ?? null,
        createdAt: String(own.createdAt),
        updatedAt: String(own.updatedAt),
        verifiedPurchase: Boolean(
          verifiedByUser
            .get(String(own.userId))
            ?.has(String(productId))
        ),
      };
    }
  }

  const reviews = reviewsForProduct.map((review) => {
    const author = userById.get(review.userId);
    return {
      id: review.id,
      rating: Number(review.rating),
      comment: review.comment ?? null,
      createdAt: String(review.createdAt),
      updatedAt: String(review.updatedAt),
      authorName: author?.name?.trim() || "Verified customer",
      isOwn: review.userId === currentUserId,
      verifiedPurchase: Boolean(
        verifiedByUser.get(String(review.userId))?.has(productId)
      ),
    };
  });

  return {
    reviews,
    reviewCount,
    averageRating: Math.round(averageRating * 10) / 10,
    currentUserReview,
    verifiedPurchase,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const payload = await buildReviewsPayload(productId);

    return NextResponse.json({
      success: true,
      ...payload,
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Please sign in to leave a review.",
        },
        { status: 401 }
      );
    }

    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    if (!(await productExists(productId))) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));

    if (!isValidRating(body.rating)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please choose a rating between 1 and 5 stars.",
        },
        { status: 400 }
      );
    }

    const comment = sanitizeComment(body.comment);

    const allReviews = await db.orm.public.Review.all();
    const duplicate = allReviews.find(
      (review) =>
        review.productId === productId &&
        review.userId === currentUserId
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already reviewed this product.",
        },
        { status: 409 }
      );
    }

    // Compute verifiedPurchase server-side from the user's order history.
    // Any client-supplied verifiedPurchase value is intentionally ignored.
    const allOrders = await db.orm.public.Order.all();
    const allOrderItems = await db.orm.public.OrderItem.all();
    const verifiedByUser = computeVerifiedProductsByUser(
      allOrders,
      allOrderItems
    );
    const verifiedPurchase = Boolean(
      verifiedByUser.get(String(currentUserId))?.has(String(productId))
    );

    const timestamp = nowInstant();

    try {
      await db.orm.public.Review.create({
        id: crypto.randomUUID(),
        productId,
        userId: currentUserId,
        rating: body.rating,
        comment: comment || null,
        verifiedPurchase,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      if (/unique|23505/i.test(message)) {
        return NextResponse.json(
          {
            success: false,
            error: "You have already reviewed this product.",
          },
          { status: 409 }
        );
      }
      throw error;
    }

    const payload = await buildReviewsPayload(productId);

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your review!",
        ...payload,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Reviews POST error:", error);
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


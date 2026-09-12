"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface ReviewAuthor {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  isOwn: boolean;
  verifiedPurchase: boolean;
}

interface ReviewPayload {
  reviews: ReviewAuthor[];
  reviewCount: number;
  averageRating: number;
  currentUserReview: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
    verifiedPurchase: boolean;
  } | null;
  verifiedPurchase: boolean;
}

const STAR_LABELS = [
  "1 star",
  "2 stars",
  "3 stars",
  "4 stars",
  "5 stars",
] as const;

function StarRow({
  value,
  onChange,
  size = "lg",
  readOnly = false,
}: {
  value: number;
  onChange?: (next: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}) {
  const dimensions =
    size === "lg" ? "w-7 h-7" : size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div
      className="flex items-center gap-1"
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `Rated ${value} out of 5` : "Choose a rating"}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const className = `${dimensions} ${
          filled ? "text-amber-400" : "text-stone-300"
        } ${readOnly ? "" : "cursor-pointer transition-colors hover:text-amber-300"}`;

        if (readOnly) {
          return (
            <svg
              key={star}
              className={className}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={STAR_LABELS[star - 1]}
            className={className}
            onClick={() => onChange?.(star)}
          >
            <svg
              className={className}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AverageStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <StarRow value={Math.round(value)} readOnly size="md" />
      <span className="text-sm font-semibold text-[#2d2a26]">
        {value > 0 ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
      <svg
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
      Verified Purchase
    </span>
  );
}

function ReviewCard({
  review,
  onEdit,
  onDelete,
  busy,
}: {
  review: ReviewAuthor;
  onEdit?: () => void;
  onDelete?: () => void;
  busy?: boolean;
}) {
  const initials = review.authorName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="border-b border-stone-100 py-5 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-[#2d2a26]">
          {initials || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-[#2d2a26]">
              {review.authorName}
            </h4>
            {review.isOwn ? (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-600">
                You
              </span>
            ) : null}
            {review.verifiedPurchase ? <VerifiedBadge /> : null}
            <span className="text-xs text-stone-500">
              {formatDate(review.createdAt)}
            </span>
          </div>

          <div className="mt-1.5">
            <StarRow value={review.rating} readOnly size="sm" />
          </div>

          {review.comment ? (
            <p className="mt-2 text-sm leading-relaxed text-[#5a5248]">
              {review.comment}
            </p>
          ) : null}

          {review.isOwn && (onEdit || onDelete) ? (
            <div className="mt-3 flex items-center gap-3">
              {onEdit ? (
                <button
                  type="button"
                  onClick={onEdit}
                  disabled={busy}
                  className="text-xs font-semibold text-[#2d2a26] hover:underline disabled:opacity-50"
                >
                  Edit
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={busy}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ReviewForm({
  initialRating,
  initialComment,
  verifiedPurchase,
  submitLabel,
  onSubmit,
  onCancel,
  busy,
  errorMessage,
}: {
  initialRating: number;
  initialComment: string;
  verifiedPurchase: boolean;
  submitLabel: string;
  onSubmit: (input: { rating: number; comment: string }) => void;
  onCancel?: () => void;
  busy: boolean;
  errorMessage: string;
}) {
  const [rating, setRating] = useState<number>(initialRating || 0);
  const [comment, setComment] = useState<string>(initialComment || "");
  const [validation, setValidation] = useState<string>("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidation("");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setValidation("Please choose a rating between 1 and 5 stars.");
      return;
    }
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-[#2d2a26]">
          {submitLabel === "Save changes"
            ? "Edit your review"
            : "Write a review"}
        </h4>
        {verifiedPurchase ? <VerifiedBadge /> : null}
      </div>

      <div className="mb-3">
        <label className="mb-2 block text-xs font-medium text-stone-600">
          Your rating
        </label>
        <StarRow value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="mb-3">
        <label
          htmlFor="review-comment"
          className="mb-2 block text-xs font-medium text-stone-600"
        >
          Your review{" "}
          <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          maxLength={4000}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share what you loved (or didn't love) about this product…"
          className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-[#1a1a1a] placeholder:text-stone-400 focus:border-[#2d2a26]/40 focus:outline-none focus:ring-2 focus:ring-[#2d2a26]/10"
          disabled={busy}
        />
      </div>

      {validation ? (
        <p className="mb-3 text-xs font-medium text-red-600">
          {validation}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mb-3 text-xs font-medium text-red-600">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || rating === 0}
          className="rounded-full bg-[#2d2a26] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-xs font-semibold text-stone-500 hover:text-[#2d2a26] disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default function Reviews({ productId }: { productId: string }) {
  const [payload, setPayload] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [actionMessage, setActionMessage] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoadError("");
      const response = await fetch(
        `/api/products/${productId}/reviews`,
        { cache: "no-store" }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load reviews.");
      }
      setPayload({
        reviews: data.reviews || [],
        reviewCount: data.reviewCount || 0,
        averageRating: data.averageRating || 0,
        currentUserReview: data.currentUserReview || null,
        verifiedPurchase: Boolean(data.verifiedPurchase),
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        if (!cancelled) setIsLoggedIn(response.ok);
      } catch {
        if (!cancelled) setIsLoggedIn(false);
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (input: {
    rating: number;
    comment: string;
  }) => {
    setSubmitting(true);
    setFormError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `/api/products/${productId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to save review.");
      }
      setMode("idle");
      setActionMessage("Thank you for your review!");
      await load();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (input: {
    rating: number;
    comment: string;
  }) => {
    if (!payload?.currentUserReview) return;

    setSubmitting(true);
    setFormError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `/api/reviews/${payload.currentUserReview.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to update review.");
      }
      setMode("idle");
      setActionMessage("Your review has been updated.");
      await load();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to update review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!payload?.currentUserReview) return;

    const confirmed = window.confirm(
      "Delete your review? This cannot be undone."
    );
    if (!confirmed) return;

    setSubmitting(true);
    setFormError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `/api/reviews/${payload.currentUserReview.id}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to delete review.");
      }
      setMode("idle");
      setActionMessage("Your review has been removed.");
      await load();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to delete review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const ownReview = payload?.currentUserReview ?? null;
  const hasOwnReview = Boolean(ownReview);

  return (
    <section className="mb-16 md:mb-20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#2d2a26]">
            Customer Reviews
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <AverageStars value={payload?.averageRating ?? 0} />
            <span className="text-sm text-stone-500">
              {payload
                ? `${payload.reviewCount} ${
                    payload.reviewCount === 1 ? "review" : "reviews"
                  }`
                : "—"}
            </span>
          </div>
        </div>

        {isLoggedIn && !hasOwnReview && mode !== "create" ? (
          <button
            type="button"
            onClick={() => {
              setMode("create");
              setFormError("");
              setActionMessage("");
            }}
            className="rounded-full border border-stone-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#2d2a26] transition-colors hover:bg-stone-50"
          >
            Write a review
          </button>
        ) : null}
      </div>

      {actionMessage ? (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
          {actionMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-stone-500">
              <svg
                className="h-4 w-4 animate-spin text-stone-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="60 40"
                />
              </svg>
              Loading reviews…
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : payload && payload.reviews.length > 0 ? (
            <div className="rounded-2xl border border-stone-100 bg-white px-5 shadow-sm">
              {payload.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={
                    review.isOwn
                      ? () => {
                          setMode("edit");
                          setFormError("");
                          setActionMessage("");
                        }
                      : undefined
                  }
                  onDelete={
                    review.isOwn && !submitting
                      ? handleDelete
                      : undefined
                  }
                  busy={submitting}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 px-6 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <svg
                  className="h-5 w-5 text-[#8b6f5a]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#2d2a26]">
                No reviews yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-stone-500">
                Be the first to share your thoughts on this product.
              </p>
            </div>
          )}
        </div>

        <aside>
          {isLoggedIn === false ? (
            <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
              <h3 className="text-sm font-semibold text-[#2d2a26]">
                Share your thoughts
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Sign in to leave a review for this product.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="rounded-full bg-[#2d2a26] px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#1a1a1a]"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-[#2d2a26] transition-colors hover:bg-stone-50"
                >
                  Create an account
                </Link>
              </div>
            </div>
          ) : isLoggedIn === null ? (
            <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5 text-sm text-stone-500">
              Checking your account…
            </div>
          ) : hasOwnReview ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#2d2a26]">
                    Your review
                  </h3>
                  {ownReview?.verifiedPurchase ? <VerifiedBadge /> : null}
                </div>
                <StarRow
                  value={ownReview?.rating ?? 0}
                  readOnly
                  size="md"
                />
                {ownReview?.comment ? (
                  <p className="mt-2 text-sm leading-relaxed text-[#5a5248]">
                    {ownReview.comment}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-stone-500">
                    You left a rating without a written comment.
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("edit");
                      setFormError("");
                      setActionMessage("");
                    }}
                    disabled={submitting}
                    className="text-xs font-semibold text-[#2d2a26] hover:underline disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting}
                    className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : mode === "create" ? (
            <ReviewForm
              initialRating={0}
              initialComment=""
              verifiedPurchase={Boolean(payload?.verifiedPurchase)}
              submitLabel="Submit review"
              onSubmit={handleCreate}
              onCancel={() => {
                setMode("idle");
                setFormError("");
              }}
              busy={submitting}
              errorMessage={formError}
            />
          ) : (
            <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
              <h3 className="text-sm font-semibold text-[#2d2a26]">
                Already own this?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Tell other shoppers about your experience.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode("create");
                  setFormError("");
                  setActionMessage("");
                }}
                className="mt-4 w-full rounded-full bg-[#2d2a26] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#1a1a1a]"
              >
                Write a review
              </button>
            </div>
          )}

          {mode === "edit" && hasOwnReview ? (
            <div className="mt-4">
              <ReviewForm
                initialRating={ownReview!.rating}
                initialComment={ownReview!.comment ?? ""}
                verifiedPurchase={Boolean(payload?.verifiedPurchase)}
                submitLabel="Save changes"
                onSubmit={handleUpdate}
                onCancel={() => {
                  setMode("idle");
                  setFormError("");
                }}
                busy={submitting}
                errorMessage={formError}
              />
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}


"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HeroSlide = {
  id: string;
  title: string;
  description: string | null;
  mediaType: string;
  mediaUrl: string;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isActive: boolean;
  animation: string;
  animationDuration: number;
};

type HeroCarouselProps = {
  fallback?: HeroSlide[];
};

const AUTOPLAY_INTERVAL = 6500;
const DEFAULT_ANIMATION = "fade";
const DEFAULT_DURATION = 600;

function normalizeMediaType(value: string): "IMAGE" | "VIDEO" {
  return value?.toUpperCase() === "VIDEO" ? "VIDEO" : "IMAGE";
}

function isLikelyVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function normalizeSlide(slide: HeroSlide): HeroSlide {
  return {
    ...slide,
    mediaType: normalizeMediaType(slide.mediaType),
    animation: slide.animation || DEFAULT_ANIMATION,
    animationDuration:
      Number(slide.animationDuration) > 0
        ? Number(slide.animationDuration)
        : DEFAULT_DURATION,
  };
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ fallback }) => {
  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  /*
   * Load hero slides from the database/API.
   */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/hero", {
          cache: "no-store",
        });

        const data = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (response.ok && Array.isArray(data.slides)) {
          const normalizedSlides = data.slides
            .filter((slide: HeroSlide) => slide?.isActive !== false)
            .sort(
              (a: HeroSlide, b: HeroSlide) =>
                (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
            )
            .map(normalizeSlide);

          setSlides(normalizedSlides);
        } else {
          setSlides([]);
        }
      } catch {
        if (!cancelled) {
          setSlides([]);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Resolve API slides first, then fallback slides.
   */
  const resolvedSlides = useMemo<HeroSlide[]>(() => {
    if (slides && slides.length > 0) {
      return slides.map(normalizeSlide);
    }

    if (fallback && fallback.length > 0) {
      return fallback.map(normalizeSlide);
    }

    return [];
  }, [slides, fallback]);

  const total = resolvedSlides.length;

  /*
   * Keep active index valid if slides are removed/changed.
   */
  useEffect(() => {
    if (total === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex >= total) {
      setActiveIndex(0);
    }
  }, [activeIndex, total]);

  /*
   * Auto-play.
   */
  useEffect(() => {
    if (total <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTOPLAY_INTERVAL);

    return () => {
      window.clearInterval(timer);
    };
  }, [total]);

  /*
   * Navigate to a slide.
   */
  const goTo = (index: number) => {
    if (isAnimating || total <= 1) return;

    const newIndex = Math.max(0, Math.min(index, total - 1));

    if (newIndex === activeIndex) return;

    setIsAnimating(true);
    setActiveIndex(newIndex);

    window.setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const goPrevious = () => {
    if (total <= 1) return;

    const previousIndex =
      activeIndex === 0 ? total - 1 : activeIndex - 1;

    goTo(previousIndex);
  };

  const goNext = () => {
    if (total <= 1) return;

    goTo((activeIndex + 1) % total);
  };

  const active = resolvedSlides[activeIndex];

  /*
   * Empty/fallback state.
   */
  if (!active || total === 0) {
    return (
      <section className="w-full px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-6xl rounded-2xl bg-gradient-to-br from-[#e8dfd0] to-[#f5ede0] px-6 py-10 sm:px-8 md:px-12 md:py-14">
          <p className="text-center font-serif text-xl text-[#2d2a26] sm:text-2xl">
            Discover thoughtful gifts for every occasion
          </p>
        </div>
      </section>
    );
  }

  const isVideo =
    normalizeMediaType(active.mediaType) === "VIDEO" ||
    (active.mediaUrl && isLikelyVideoUrl(active.mediaUrl));

  return (
    <section className="relative w-full overflow-visible px-3 py-5 sm:px-5 sm:py-7 md:px-8 md:py-8 lg:px-10">
      {/*
       * Main carousel frame.
       *
       * `relative` is important here because the arrows,
       * indicators and floating card are positioned relative
       * to this container instead of the whole page.
       */}
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="grid w-full grid-cols-1 items-center gap-7 sm:gap-9 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/*
           * LEFT / TEXT CONTENT
           */}
          <div className="order-1 flex min-w-0 flex-col justify-center px-2 text-center sm:px-4 lg:order-1 lg:px-6 lg:text-left xl:px-8">
            <div className="mx-auto w-full max-w-xl lg:mx-0">
              <h1
                key={`title-${active.id}`}
                className="font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-[#2d2a26] sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.7rem]"
              >
                {active.title}
              </h1>

              {active.description && (
                <p
                  key={`description-${active.id}`}
                  className="mx-auto mt-4 max-w-lg text-sm leading-7 text-neutral-600 sm:mt-5 sm:text-base sm:leading-7 md:text-lg lg:mx-0"
                >
                  {active.description}
                </p>
              )}

              {active.buttonLink && (
                <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-7 lg:justify-start">
                  {active.buttonLink.startsWith("/") ||
                  active.buttonLink.startsWith("#") ? (
                    <Link
                      href={active.buttonLink}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2d2a26] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1a1a1a] hover:shadow-md sm:px-7"
                    >
                      {active.buttonText || "Shop Now"}

                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  ) : (
                    <a
                      href={active.buttonLink}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2d2a26] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1a1a1a] hover:shadow-md sm:px-7"
                    >
                      {active.buttonText || "Shop Now"}

                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              )}

              {/*
               * Small trust indicators.
               */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-[#5a5248] sm:mt-9 sm:text-xs lg:justify-start">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-[#8b6f5a]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M10 2L8.09 8H2l5 3.64L5.18 18 10 14.27 14.82 18 13 11.64 18 8h-6.09L10 2z" />
                  </svg>

                  <span>4.9 / 5 from 12k+ reviews</span>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <svg
                    className="h-4 w-4 text-[#8b6f5a]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                  <span>Free gift wrapping</span>
                </div>
              </div>
            </div>
          </div>

          {/*
           * RIGHT / MEDIA CONTENT
           */}
          <div className="order-2 min-w-0 px-1 sm:px-2 lg:order-2">
            <div className="relative mx-auto w-full max-w-[680px]">
              {/*
               * Media wrapper.
               *
               * The overflow-hidden is ONLY on the media itself.
               * Therefore the floating card can safely sit outside
               * the image without clipping.
               */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8dfd0] to-[#f5ede0] shadow-xl sm:rounded-3xl sm:shadow-2xl md:aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/10]">
                {isVideo ? (
                  <video
                    key={active.mediaUrl}
                    src={active.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    key={active.mediaUrl}
                    src={active.mediaUrl}
                    alt={active.title}
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 55vw"
                  />
                )}

                {/*
                 * Very subtle overlay for visual depth.
                 */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/5" />
              </div>

              {/*
               * Floating social-proof card.
               *
               * Hidden on very small screens because there isn't
               * enough room. Appears from sm breakpoint onward.
               */}
              <div className="absolute -bottom-5 left-3 z-20 hidden w-[178px] rounded-xl bg-white p-3.5 shadow-xl sm:block md:-bottom-6 md:-left-5 md:w-44 md:p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="h-6 w-6 rounded-full border-2 border-white bg-pink-200" />
                    <div className="h-6 w-6 rounded-full border-2 border-white bg-amber-200" />
                    <div className="h-6 w-6 rounded-full border-2 border-white bg-emerald-200" />
                  </div>

                  <span className="text-[11px] text-stone-500">
                    +2k today
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#2d2a26]">
                  Hand-picked gifts
                </p>

                <p className="mt-0.5 text-[10px] text-stone-500">
                  Delivered with care
                </p>
              </div>
            </div>
          </div>
        </div>

        {/*
         * DESKTOP / TABLET NAVIGATION
         *
         * These are now positioned relative to the actual carousel
         * frame, not the entire webpage.
         */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              disabled={isAnimating}
              aria-label="Previous slide"
              className="absolute left-0 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#2d2a26] shadow-lg ring-1 ring-black/5 backdrop-blur transition-all hover:scale-105 hover:bg-white disabled:pointer-events-none disabled:opacity-50 sm:flex lg:-left-3 xl:-left-5"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={isAnimating}
              aria-label="Next slide"
              className="absolute right-0 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#2d2a26] shadow-lg ring-1 ring-black/5 backdrop-blur transition-all hover:scale-105 hover:bg-white disabled:pointer-events-none disabled:opacity-50 sm:flex lg:-right-3 xl:-right-5"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/*
       * MOBILE NAVIGATION
       *
       * On phones the arrows move below the media instead of
       * floating against the browser edges.
       */}
      {total > 1 && (
        <div className="mx-auto mt-5 flex w-full max-w-7xl items-center justify-center gap-4 sm:hidden">
          <button
            type="button"
            onClick={goPrevious}
            disabled={isAnimating}
            aria-label="Previous slide"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2d2a26] shadow-md ring-1 ring-stone-200 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex min-w-0 items-center justify-center gap-1.5">
            {resolvedSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                disabled={isAnimating}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-6 bg-[#2d2a26]"
                    : "w-1.5 bg-[#2d2a26]/25 hover:bg-[#2d2a26]/45"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={isAnimating}
            aria-label="Next slide"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2d2a26] shadow-md ring-1 ring-stone-200 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/*
       * DESKTOP / TABLET DOT INDICATORS
       */}
      {total > 1 && (
        <div className="mt-6 hidden items-center justify-center gap-2 sm:flex md:mt-7">
          {resolvedSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              disabled={isAnimating}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? "w-7 bg-[#2d2a26]"
                  : "w-2 bg-[#2d2a26]/25 hover:bg-[#2d2a26]/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export type { HeroSlide };

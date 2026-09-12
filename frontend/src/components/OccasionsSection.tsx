"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Occasion = {
  id: string;
  name: string;
  image: string;
};

type SectionData = {
  title: string;
  subtitle: string;
  isActive: boolean;
  items: Occasion[];
};

const fallbackOccasions: Occasion[] = [
  {
    id: "occasion-1",
    name: "Birthday",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "occasion-2",
    name: "Anniversary",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "occasion-3",
    name: "Wedding",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "occasion-4",
    name: "Thank You",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "occasion-5",
    name: "Just Because",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "occasion-6",
    name: "Holiday",
    image:
      "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=600&q=80",
  },
];

export const OccasionsSection: React.FC =
  () => {
    const [section, setSection] =
      useState<SectionData | null>(null);

    const [loading, setLoading] =
      useState(true);

    useEffect(() => {
      let cancelled = false;

      async function load() {
        try {
          const response = await fetch(
            "/api/home-sections",
            {
              cache: "no-store",
            }
          );

          if (!response.ok) {
            throw new Error(
              "Unable to load occasions."
            );
          }

          const data =
            await response.json();

          const serverSection =
            data?.sections?.occasion;

          if (
            !cancelled &&
            serverSection
          ) {
            setSection({
              title:
                serverSection.title ||
                "Shop by Occasion",

              subtitle:
                serverSection.subtitle ||
                "Perfect gifts for every occasion",

              isActive:
                serverSection.isActive !== false,

              items:
                Array.isArray(
                  serverSection.items
                )
                  ? serverSection.items.map(
                      (item: Occasion) => ({
                        id: item.id,
                        name: item.name,
                        image:
                          item.image || "",
                      })
                    )
                  : [],
            });
          }
        } catch (error) {
          console.error(
            "Occasions section load error:",
            error
          );

          if (!cancelled) {
            setSection({
              title: "Shop by Occasion",
              subtitle:
                "Make it special",
              isActive: true,
              items:
                fallbackOccasions,
            });
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      load();

      return () => {
        cancelled = true;
      };
    }, []);

    /*
     * ------------------------------------------------------------------------
     * LOADING
     * ------------------------------------------------------------------------
     */

    if (loading) {
      return (
        <section className="py-2">
          <div className="mb-8">
            <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />

            <div className="mt-3 h-3 w-48 animate-pulse rounded bg-stone-100" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/5] animate-pulse rounded-2xl bg-stone-100"
              />
            ))}
          </div>
        </section>
      );
    }

    /*
     * ------------------------------------------------------------------------
     * INACTIVE SECTION
     * ------------------------------------------------------------------------
     */

    if (!section?.isActive) {
      return null;
    }

    /*
     * ------------------------------------------------------------------------
     * ITEMS
     * ------------------------------------------------------------------------
     */

    const occasions =
      section.items.length > 0
        ? section.items
        : fallbackOccasions;

    return (
      <section className="py-2">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">

          <div>
            <h2 className="text-2xl font-serif font-semibold tracking-tight text-[#2d2a26] sm:text-3xl">
              {section.title}
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {section.subtitle}
            </p>
          </div>

          {/* View All */}
          <Link
            href="/occasions"
            className="hidden text-xs font-semibold text-[#8b6f5a] transition hover:text-[#2d2a26] sm:block"
          >
            View all
          </Link>

        </div>

        {/* Occasion Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

          {occasions.map(
            (occasion) => {

              /*
               * The database only stores the occasion name.
               * Build the search URL dynamically.
               *
               * Example:
               *
               * Birthday
               *     ↓
               * /search?occasion=Birthday
               *
               * Thank You
               *     ↓
               * /search?occasion=Thank%20You
               */

              const occasionHref =
                `/search?occasion=${encodeURIComponent(
                  occasion.name
                )}`;

              return (
                <Link
                  key={occasion.id}
                  href={occasionHref}
                  className="group"
                >

                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">

                    {occasion.image ? (
                      <img
                        src={occasion.image}
                        alt={occasion.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
                        No image
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-12">

                      <p className="text-sm font-semibold text-white">
                        {occasion.name}
                      </p>

                    </div>

                  </div>

                </Link>
              );
            }
          )}

        </div>

      </section>
    );
  };

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Recipient = {
  id: string;
  name: string;
  image: string;
};

type SectionData = {
  title: string;
  subtitle: string;
  isActive: boolean;
  items: Recipient[];
};

const fallbackRecipients: Recipient[] = [
  {
    id: "recipient-1",
    name: "For Her",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "recipient-2",
    name: "For Him",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "recipient-3",
    name: "For Kids",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "recipient-4",
    name: "Couples",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "recipient-5",
    name: "Parents",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "recipient-6",
    name: "Friends",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
  },
];

export const RecipientsSection: React.FC =
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
              "Unable to load recipients."
            );
          }

          const data =
            await response.json();

          const serverSection =
            data?.sections?.recipient;

          if (
            !cancelled &&
            serverSection
          ) {
            setSection({
              title:
                serverSection.title ||
                "Shop by Recipient",

              subtitle:
                serverSection.subtitle ||
                "Find the perfect gift for everyone",

              isActive:
                serverSection.isActive !== false,

              items:
                Array.isArray(
                  serverSection.items
                )
                  ? serverSection.items.map(
                      (item: Recipient) => ({
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
            "Recipients section load error:",
            error
          );

          if (!cancelled) {
            setSection({
              title: "Shop by Recipient",
              subtitle:
                "Curated for you",
              isActive: true,
              items:
                fallbackRecipients,
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

    const recipients =
      section.items.length > 0
        ? section.items
        : fallbackRecipients;

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
            href="/recipients"
            className="hidden text-xs font-semibold text-[#8b6f5a] transition hover:text-[#2d2a26] sm:block"
          >
            View all
          </Link>

        </div>

        {/* Recipient Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

          {recipients.map(
            (recipient) => {

              /*
               * IMPORTANT:
               * The database does not need an `href` field.
               * We create the search URL from the current
               * recipient name.
               *
               * Example:
               * "For Her"
               *     ↓
               * /search?recipient=For%20Her
               *
               * If admin changes the name to:
               * "Sister"
               *     ↓
               * /search?recipient=Sister
               */

              const recipientHref =
                `/search?recipient=${encodeURIComponent(
                  recipient.name
                )}`;

              return (
                <Link
                  key={recipient.id}
                  href={recipientHref}
                  className="group"
                >

                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">

                    {recipient.image ? (
                      <img
                        src={recipient.image}
                        alt={recipient.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
                        No image
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-12">

                      <p className="text-sm font-semibold text-white">
                        {recipient.name}
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

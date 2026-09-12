import Link from "next/link";
import Image from "next/image";

import { db } from "@/prisma/db";

export const dynamic = "force-dynamic";

async function getRecipients() {
  const rows = await db.orm.public.Recipient.all();

  return [...rows]
    .filter((recipient) => recipient.isActive)
    .sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
}

async function getRecipientSection() {
  return await db.orm.public.HomeSection
    .where({ key: "recipient" })
    .first();
}

export default async function RecipientsPage() {
  const [recipients, section] = await Promise.all([
    getRecipients(),
    getRecipientSection(),
  ]);

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8b6f5a] mb-2 block">
            Curated for you
          </span>

          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-[#2d2a26]">
            {section?.title || "Shop by Recipient"}
          </h1>

          <p className="mt-4 text-sm md:text-base text-[#6f6962] leading-relaxed">
            {section?.subtitle ||
              "Find thoughtful gifts chosen for the special people in your life."}
          </p>
        </div>

        {/* Recipient Grid */}
        {recipients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {recipients.map((recipient, index) => {
              const image =
                recipient.image ||
                "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80";

              return (
                <Link
                  key={recipient.id}
                  href={`/search?recipient=${encodeURIComponent(
                    recipient.name
                  )}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-white">
                    <Image
                      src={image}
                      alt={recipient.name}
                      fill
                      priority={index === 0}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <h2 className="text-white text-xl md:text-2xl font-semibold">
                        {recipient.name}
                      </h2>

                      <p className="mt-1 text-white/85 text-sm">
                        {recipient.description ||
                          `Thoughtful gifts for ${recipient.name.toLowerCase()}.`}
                      </p>

                      <div className="mt-3 inline-flex items-center gap-1.5 text-white text-sm font-medium">
                        Shop gifts

                        <svg
                          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-stone-200 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-[#2d2a26]">
              No recipients available
            </h2>

            <p className="mt-2 text-sm text-[#6f6962]">
              Recipient options will appear here when they are added
              from the admin panel.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

import { NextResponse } from "next/server";

import { db } from "@/prisma/db";

/**
 * Customer-facing Home Sections endpoint.
 *
 * Returns the two homepage sections:
 * - Shop by Recipient
 * - Shop by Occasion
 *
 * Section metadata comes from HomeSection.
 * Items come from Recipient / Occasion.
 */
export async function GET() {
  try {
    const [sections, recipients, occasions] = await Promise.all([
      db.orm.public.HomeSection.all(),
      db.orm.public.Recipient.all(),
      db.orm.public.Occasion.all(),
    ]);

    const recipientSection = sections.find(
      (section) => section.key === "recipient"
    );

    const occasionSection = sections.find(
      (section) => section.key === "occasion"
    );

    return NextResponse.json({
      success: true,
      sections: {
        recipient: recipientSection
          ? {
              id: recipientSection.id,
              key: recipientSection.key,
              title: recipientSection.title,
              subtitle: recipientSection.subtitle ?? null,
              isActive: recipientSection.isActive,
              items: recipients
                .filter((item) => item.isActive)
                .sort(
                  (a, b) =>
                    Number(a.sortOrder || 0) -
                    Number(b.sortOrder || 0)
                )
                .map((item) => ({
                  id: item.id,
                  name: item.name,
                  image: item.image ?? null,
                  sortOrder: Number(item.sortOrder || 0),
                  isActive: item.isActive,
                })),
            }
          : null,

        occasion: occasionSection
          ? {
              id: occasionSection.id,
              key: occasionSection.key,
              title: occasionSection.title,
              subtitle: occasionSection.subtitle ?? null,
              isActive: occasionSection.isActive,
              items: occasions
                .filter((item) => item.isActive)
                .sort(
                  (a, b) =>
                    Number(a.sortOrder || 0) -
                    Number(b.sortOrder || 0)
                )
                .map((item) => ({
                  id: item.id,
                  name: item.name,
                  image: item.image ?? null,
                  sortOrder: Number(item.sortOrder || 0),
                  isActive: item.isActive,
                })),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Public home sections GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

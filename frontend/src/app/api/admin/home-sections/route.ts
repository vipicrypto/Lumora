import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/prisma/db";

type SectionKey = "recipient" | "occasion";

type ItemInput = {
  id?: string;
  name?: string;
  image?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

function isSectionKey(value: unknown): value is SectionKey {
  return value === "recipient" || value === "occasion";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getAdminUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("lumora_user_id")?.value;

  if (!userId) {
    return null;
  }

  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

async function getSection(section: SectionKey) {
  return await db.orm.public.HomeSection
    .where({ key: section })
    .first();
}

async function ensureSection(section: SectionKey) {
  const existing = await getSection(section);

  if (existing) {
    return existing;
  }

  if (section === "recipient") {
    return await db.orm.public.HomeSection.create({
      id: crypto.randomUUID(),
      key: "recipient",
      title: "Shop by Recipient",
      subtitle: "Find the perfect gift for everyone",
      isActive: true,
    });
  }

  return await db.orm.public.HomeSection.create({
    id: crypto.randomUUID(),
    key: "occasion",
    title: "Shop by Occasion",
    subtitle: "Perfect gifts for every occasion",
    isActive: true,
  });
}

async function getItems(section: SectionKey) {
  if (section === "recipient") {
    const rows = await db.orm.public.Recipient.all();

    return [...rows].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
  }

  const rows = await db.orm.public.Occasion.all();

  return [...rows].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
}

/* -------------------------------------------------------------------------- */
/* GET                                                                        */
/* -------------------------------------------------------------------------- */

export async function GET(request: NextRequest) {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sectionParam =
      request.nextUrl.searchParams.get("section");

    if (sectionParam) {
      if (!isSectionKey(sectionParam)) {
        return NextResponse.json(
          { error: "Invalid section" },
          { status: 400 }
        );
      }

      const section =
        await ensureSection(sectionParam);

      const items =
        await getItems(sectionParam);

      return NextResponse.json({
        success: true,
        section,
        items,
      });
    }

    const recipientSection =
      await ensureSection("recipient");

    const occasionSection =
      await ensureSection("occasion");

    const recipientItems =
      await getItems("recipient");

    const occasionItems =
      await getItems("occasion");

    return NextResponse.json({
      success: true,
      sections: {
        recipient: {
          ...recipientSection,
          items: recipientItems,
        },
        occasion: {
          ...occasionSection,
          items: occasionItems,
        },
      },
    });
  } catch (error) {
    console.error(
      "ADMIN HOME SECTIONS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load home sections",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PUT                                                                        */
/* -------------------------------------------------------------------------- */

export async function PUT(request: NextRequest) {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!isSectionKey(body?.section)) {
      return NextResponse.json(
        { error: "Invalid section" },
        { status: 400 }
      );
    }

    const section = body.section as SectionKey;

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const subtitle =
      typeof body.subtitle === "string"
        ? body.subtitle.trim()
        : "";

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    const items: ItemInput[] =
      Array.isArray(body.items)
        ? body.items
        : [];

    const sectionData =
      await ensureSection(section);

    await db.orm.public.HomeSection
      .where({ id: sectionData.id })
      .updateAll({
        title,
        subtitle,
        isActive,
      });

    /* ---------------------------------------------------------------------- */
    /* RECIPIENTS                                                             */
    /* ---------------------------------------------------------------------- */

    if (section === "recipient") {
      const existingItems =
        await db.orm.public.Recipient.all();

      const submittedIds = new Set(
        items
          .map((item) => item.id)
          .filter(
            (id): id is string =>
              typeof id === "string" &&
              id.trim().length > 0
          )
      );

      for (const existing of existingItems) {
        if (
          existing.isActive &&
          !submittedIds.has(existing.id)
        ) {
          await db.orm.public.Recipient
            .where({ id: existing.id })
            .updateAll({
              isActive: false,
            });
        }
      }

      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        const item = items[index];

        const name =
          typeof item.name === "string"
            ? item.name.trim()
            : "";

        if (!name) {
          continue;
        }

        const image =
          typeof item.image === "string"
            ? item.image
            : null;

        const sortOrder =
          typeof item.sortOrder === "number"
            ? item.sortOrder
            : index;

        const active =
          typeof item.isActive === "boolean"
            ? item.isActive
            : true;

        if (item.id) {
          const existing =
            existingItems.find(
              (row) => row.id === item.id
            );

          if (existing) {
            await db.orm.public.Recipient
              .where({ id: item.id })
              .updateAll({
                name,
                image,
                sortOrder,
                isActive: active,
              });

            continue;
          }
        }

        await db.orm.public.Recipient.create({
          id: crypto.randomUUID(),
          name,
          slug: slugify(name),
          description: "",
          image,
          isActive: active,
          sortOrder,
        });
      }
    }

    /* ---------------------------------------------------------------------- */
    /* OCCASIONS                                                              */
    /* ---------------------------------------------------------------------- */

    if (section === "occasion") {
      const existingItems =
        await db.orm.public.Occasion.all();

      const submittedIds = new Set(
        items
          .map((item) => item.id)
          .filter(
            (id): id is string =>
              typeof id === "string" &&
              id.trim().length > 0
          )
      );

      for (const existing of existingItems) {
        if (
          existing.isActive &&
          !submittedIds.has(existing.id)
        ) {
          await db.orm.public.Occasion
            .where({ id: existing.id })
            .updateAll({
              isActive: false,
            });
        }
      }

      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        const item = items[index];

        const name =
          typeof item.name === "string"
            ? item.name.trim()
            : "";

        if (!name) {
          continue;
        }

        const image =
          typeof item.image === "string"
            ? item.image
            : null;

        const sortOrder =
          typeof item.sortOrder === "number"
            ? item.sortOrder
            : index;

        const active =
          typeof item.isActive === "boolean"
            ? item.isActive
            : true;

        if (item.id) {
          const existing =
            existingItems.find(
              (row) => row.id === item.id
            );

          if (existing) {
            await db.orm.public.Occasion
              .where({ id: item.id })
              .updateAll({
                name,
                image,
                sortOrder,
                isActive: active,
              });

            continue;
          }
        }

        await db.orm.public.Occasion.create({
          id: crypto.randomUUID(),
          name,
          slug: slugify(name),
          description: "",
          image,
          isActive: active,
          sortOrder,
        });
      }
    }

    const updatedSection =
      await getSection(section);

    const updatedItems =
      await getItems(section);

    return NextResponse.json({
      success: true,
      section: updatedSection,
      items: updatedItems,
    });
  } catch (error) {
    console.error(
      "ADMIN HOME SECTIONS PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to save home section",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

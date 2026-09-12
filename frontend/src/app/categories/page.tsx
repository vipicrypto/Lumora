import Link from "next/link";
import { db } from "@/prisma/db";

export const dynamic = "force-dynamic";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
};

const fallbackImages: Record<string, string> = {
  "Personalized Gifts":
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
  "Gift Sets":
    "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80",
  Jewelry:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
  "Home & Living":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
  "Beauty & Self Care":
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
  "Fashion & Accessories":
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
  Stationery:
    "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80",
  "Toys & Kids":
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
};

const preferredOrder = [
  "Personalized Gifts",
  "Gift Sets",
  "Jewelry",
  "Home & Living",
  "Beauty & Self Care",
  "Fashion & Accessories",
  "Stationery",
  "Toys & Kids",
];

const fallbackCategories: CategoryItem[] = preferredOrder.map((name, index) => ({
  id: `fallback-${index}`,
  name,
  slug: name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-"),
  description: null,
  image: fallbackImages[name] ?? null,
}));

async function getCategories(): Promise<CategoryItem[]> {
  try {
    const categories = await db.orm.public.Category
      .where({ isActive: true })
      .all();

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      image: category.image ?? null,
    }));
  } catch (error) {
    console.error("Failed to load categories from database:", error);

    // Keep the public page usable if the database is temporarily unavailable.
    return fallbackCategories;
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  const orderedCategories = [...categories].sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a.name);
    const bIndex = preferredOrder.indexOf(b.name);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.name.localeCompare(b.name);
  });

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8b6f5a] mb-2 block">
            Browse our collections
          </span>

          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-[#2d2a26]">
            Shop by Category
          </h1>

          <p className="mt-4 text-sm md:text-base text-[#6f6962] leading-relaxed">
            Explore thoughtful gifts across all of our curated collections.
          </p>
        </div>

        {orderedCategories.length === 0 ? (
          <div className="rounded-2xl bg-white border border-neutral-200 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-[#2d2a26]">
              No categories available
            </h2>

            <p className="mt-2 text-sm text-[#6f6962]">
              Please check back soon for our latest collections.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {orderedCategories.map((category) => {
              const image =
                category.image || fallbackImages[category.name];

              if (!image) {
                return null;
              }

              return (
                <Link
                  key={category.id}
                  href={`/search?category=${encodeURIComponent(
                    category.slug
                  )}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-white">
                    <img
                      src={image}
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <h2 className="text-white text-xl md:text-2xl font-semibold">
                        {category.name}
                      </h2>

                      {category.description && (
                        <p className="mt-1 text-white/85 text-sm">
                          {category.description}
                        </p>
                      )}

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
        )}
      </section>
    </main>
  );
}

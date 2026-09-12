import { db } from "@/prisma/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

function getPrimaryImage(
  value: string | null | undefined
): string {
  if (!value) return "";

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      const firstImage = parsed.find(
        (item): item is string =>
          typeof item === "string" &&
          item.trim().length > 0
      );

      return firstImage?.trim() || "";
    }
  } catch {
    // Legacy products may store a single URL as plain text.
  }

  return value.trim();
}

export default async function GiftsPage() {
  const products = await db.orm.public.Product
    .where({ isActive: true })
    .all();

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="mb-10 text-center md:mb-14">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#8b6f5a]">
            Thoughtful gifts for every moment
          </span>

          <h1 className="font-serif text-3xl font-semibold text-[#2d2a26] md:text-5xl">
            Gifts
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#6f6962] md:text-base">
            Discover thoughtful gifts curated for every person,
            occasion, and special moment.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-stone-100 bg-white px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-[#2d2a26]">
              No gifts available
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Please check back soon for our latest products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  image: getPrimaryImage(product.image),
                  category: product.category,
                  description: product.description,
                  rating: 4.6,
                  reviewCount: 0,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
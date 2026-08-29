import Link from "next/link";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const FeaturedProducts: React.FC = () => {
  const featured = products.slice(0, 4);
  return (
    <section>
      <div className="flex items-end justify-between mb-7">
        <div>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8b6f5a] mb-1.5 block">Hand-picked favorites</span>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#2d2a26]">Featured Gifts</h2>
        </div>
        <Link href="/featured" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#8b6f5a] hover:text-[#2d2a26] transition-colors">
          View all
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};
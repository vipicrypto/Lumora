import Link from "next/link";
import Image from "next/image";

const categories = [
  { name: "Personalized Gifts", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80", href: "/personalized" },
  { name: "Gift Sets", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=500&q=80", href: "/gift-sets" },
  { name: "Jewelry", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=500&q=80", href: "/jewelry" },
  { name: "Home & Living", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=500&q=80", href: "/home-living" },
  { name: "Beauty & Self Care", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80", href: "/beauty" },
  { name: "Fashion & Accessories", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80", href: "/fashion" },
  { name: "Stationery", image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=500&q=80", href: "/stationery" },
  { name: "Toys & Kids", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80", href: "/toys" },
];

export const CategoriesSection: React.FC = () => {
  return (
    <section>
      <div className="flex items-end justify-between mb-7">
        <div>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8b6f5a] mb-1.5 block">Browse collections</span>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#2d2a26]">Shop by Category</h2>
        </div>
        <Link href="/categories" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#8b6f5a] hover:text-[#2d2a26] transition-colors">
          View all
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {categories.map((c) => (
          <Link key={c.name} href={c.href} className="group block">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
              <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4">
                <h3 className="text-white font-semibold text-sm leading-tight drop-shadow-sm">{c.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
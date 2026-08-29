import Link from "next/link";
import Image from "next/image";

const occasions = [
  { name: "Birthday", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=500&q=80", href: "/birthday" },
  { name: "Anniversary", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=500&q=80", href: "/anniversary" },
  { name: "Wedding", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80", href: "/wedding" },
  { name: "Thank You", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=500&q=80", href: "/thank-you" },
  { name: "Just Because", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=500&q=80", href: "/just-because" },
  { name: "Holiday", image: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=500&q=80", href: "/holiday" },
];

export const OccasionsSection: React.FC = () => {
  return (
    <section>
      <div className="flex items-end justify-between mb-7">
        <div>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8b6f5a] mb-1.5 block">Make it special</span>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#2d2a26]">Shop by Occasion</h2>
        </div>
        <Link href="/occasions" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#8b6f5a] hover:text-[#2d2a26] transition-colors">
          View all
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {occasions.map((o) => (
          <Link key={o.name} href={o.href} className="group block">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
              <Image src={o.image} alt={o.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4">
                <h3 className="text-white font-semibold text-sm md:text-base leading-tight drop-shadow-sm">{o.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
import Link from "next/link";
import Image from "next/image";

const recipients = [
  { name: "For Her", image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=500&q=80", href: "/for-her" },
  { name: "For Him", image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=500&q=80", href: "/for-him" },
  { name: "For Kids", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=500&q=80", href: "/for-kids" },
  { name: "Couples", image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=500&q=80", href: "/couples" },
  { name: "Parents", image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=500&q=80", href: "/parents" },
  { name: "Friends", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500&q=80", href: "/friends" },
];

export const RecipientsSection: React.FC = () => {
  return (
    <section>
      <div className="flex items-end justify-between mb-7">
        <div>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8b6f5a] mb-1.5 block">Curated for you</span>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#2d2a26]">Shop by Recipient</h2>
        </div>
        <Link href="/recipients" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#8b6f5a] hover:text-[#2d2a26] transition-colors">
          View all
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {recipients.map((r) => (
          <Link key={r.name} href={r.href} className="group block">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
              <Image src={r.image} alt={r.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4">
                <h3 className="text-white font-semibold text-sm md:text-base leading-tight drop-shadow-sm">{r.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
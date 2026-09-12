import Link from "next/link";

export const PromotionalBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2d2a26] via-[#3d3630] to-[#5a4f42] text-white">
      <div className="absolute inset-0 opacity-20">
        <img src="https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="relative z-10 px-8 md:px-14 py-14 md:py-20 text-center">
        <span className="inline-block text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-[#c4a882] mb-4">Every moment matters</span>
        <h2 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight mb-4">Make Every Moment <span className="italic text-[#c4a882]">Special</span></h2>
        <p className="text-base md:text-lg text-stone-200 max-w-xl mx-auto mb-8 leading-relaxed">Thoughtful gifts for the people who matter. Hand-picked, beautifully wrapped, delivered with care.</p>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-white text-[#2d2a26] px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-stone-100 transition-all shadow-lg">
          Discover Gifts
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Link>
      </div>
    </section>
  );
};

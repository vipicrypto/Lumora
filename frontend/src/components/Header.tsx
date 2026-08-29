import Link from "next/link";

export const Header: React.FC = () => {
  const navLinks = [
    { name: "Gifts", href: "/gifts" },
    { name: "For Her", href: "/for-her" },
    { name: "For Him", href: "/for-him" },
    { name: "For Kids", href: "/for-kids" },
    { name: "Couples", href: "/couples" },
    { name: "Parents", href: "/parents" },
    { name: "Friends", href: "/friends" },
    { name: "Occasions", href: "/occasions" },
    { name: "Categories", href: "/categories" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/60">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#2d2a26] flex items-center justify-center">
              <span className="text-white font-serif text-lg md:text-xl font-bold leading-none">L</span>
            </div>
            <span className="text-xl md:text-2xl font-serif font-semibold tracking-tight text-[#2d2a26]">Lumora</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-6 lg:mx-10">
            <div className="relative w-full">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search gifts, categories, occasions..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-sm text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2d2a26]/10 focus:border-[#2d2a26]/30 transition-all"
              />
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-3">
            <Link href="/account" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] hover:text-[#8b6f5a] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span>Account</span>
            </Link>
            <Link href="/wishlist" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] hover:text-[#8b6f5a] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
              <span>Wishlist</span>
            </Link>
            <Link href="/cart" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] hover:text-[#8b6f5a] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-[#2d2a26] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar pb-3 -mb-0.5 text-[13px] md:text-sm font-medium text-[#5a5248]">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-[#2d2a26] whitespace-nowrap transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
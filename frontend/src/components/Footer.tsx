import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2d2a26] text-stone-300">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <span className="text-[#2d2a26] font-serif text-lg font-bold leading-none">L</span>
              </div>
              <span className="text-xl font-serif font-semibold text-white tracking-tight">Lumora</span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">Thoughtful gifts for every person, every occasion. Hand-picked, beautifully wrapped, delivered with care.</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/gifts" className="hover:text-white transition-colors">Gifts</Link></li>
              <li><Link href="/for-her" className="hover:text-white transition-colors">For Her</Link></li>
              <li><Link href="/for-him" className="hover:text-white transition-colors">For Him</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 mb-4">About Lumora</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/policies" className="hover:text-white transition-colors">Policies</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} Lumora. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-stone-400 hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>
            </Link>
            <Link href="#" className="text-stone-400 hover:text-white transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-1.13A7.72 7.72 0 0023 3z" /></svg>
            </Link>
            <Link href="#" className="text-stone-400 hover:text-white transition-colors" aria-label="Pinterest">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 4 4-8" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
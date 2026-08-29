import { FeaturedProducts } from "@/components/FeaturedProducts";
import { CategoriesSection } from "@/components/CategoriesSection";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { RecipientsSection } from "@/components/RecipientsSection";
import { OccasionsSection } from "@/components/OccasionsSection";
import { BestSellers } from "@/components/BestSellers";
import { NewArrivals } from "@/components/NewArrivals";
import { Newsletter } from "@/components/Newsletter";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f5f0e8] via-[#faf6ee] to-[#f0e8db] rounded-3xl mb-16">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-14 md:py-20 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-block text-xs md:text-sm font-semibold tracking-[0.18em] uppercase text-[#8b6f5a] mb-4">Thoughtfully Curated</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-[#2d2a26] leading-[1.1] mb-5">
              Find Something<br className="hidden sm:block" /> <span className="italic text-[#8b6f5a]">Special</span>
            </h1>
            <p className="text-base md:text-lg text-[#5a5248] max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Thoughtful gifts for every person, every occasion. Discover unique finds that make moments memorable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="#gifts" className="inline-flex items-center justify-center gap-2 bg-[#2d2a26] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md">
                Explore Gifts
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link href="#best-sellers" className="inline-flex items-center justify-center gap-2 bg-white text-[#2d2a26] border border-stone-300 px-7 py-3.5 rounded-full text-sm font-semibold hover:border-[#2d2a26] transition-all">
                Shop Best Sellers
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#5a5248]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8b6f5a]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L8.09 8H2l5 3.64L5.18 18 10 14.27 14.82 18 13 11.64 18 8h-6.09L10 2z" /></svg>
                <span>4.9 / 5 from 12k+ reviews</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8b6f5a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span>Free gift wrapping</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80" alt="Thoughtful gifts" fill className="object-cover" priority />
            </div>
            <div className="hidden md:block absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 w-44">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-pink-200 border-2 border-white" />
                  <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white" />
                  <div className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white" />
                </div>
                <span className="text-xs text-stone-500">+2k today</span>
              </div>
              <p className="text-xs text-[#2d2a26] font-semibold">Hand-picked gifts</p>
              <p className="text-[10px] text-stone-500">Delivered with care</p>
            </div>
          </div>
        </div>
      </section>

      <div id="gifts" className="space-y-16 md:space-y-20">
        <RecipientsSection />
        <OccasionsSection />
        <FeaturedProducts />
        <CategoriesSection />
        <BestSellers />
        <NewArrivals />
        <PromotionalBanner />
        <Newsletter />
      </div>
    </>
  );
}
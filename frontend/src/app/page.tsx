import { FeaturedProducts } from "@/components/FeaturedProducts";
import { CategoriesSection } from "@/components/CategoriesSection";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { RecipientsSection } from "@/components/RecipientsSection";
import { OccasionsSection } from "@/components/OccasionsSection";
import { BestSellers } from "@/components/BestSellers";
import { NewArrivals } from "@/components/NewArrivals";
import { Newsletter } from "@/components/Newsletter";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { db } from "@/prisma/db";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80";

const fallbackHeroSlides: HeroSlide[] = [
  {
    id: "lumora-default-hero",
    title: "Find Something Special",
    description:
      "Thoughtful gifts for every person, every occasion. Discover unique finds that make moments memorable.",
    mediaType: "IMAGE",
    mediaUrl: DEFAULT_HERO_IMAGE,
    buttonText: "Explore Gifts",
    buttonLink: "#gifts",
    sortOrder: 0,
    animation: "fade",
    animationDuration: 600,
    isActive: true,
  },
];

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const slides = await db.orm.public.HeroSlide.all();

    return slides
      .filter((slide) => slide.isActive)
      .sort((a, b) => {
        const orderDiff =
          Number(a.sortOrder || 0) - Number(b.sortOrder || 0);

        if (orderDiff !== 0) return orderDiff;

        return String(a.createdAt).localeCompare(String(b.createdAt));
      })
      .map((slide) => ({
        id: slide.id,
        title: slide.title,
        description: slide.description ?? null,
        mediaType: slide.mediaType,
        mediaUrl: slide.mediaUrl,
        buttonText: slide.buttonText ?? null,
        buttonLink: slide.buttonLink ?? null,
        sortOrder: Number(slide.sortOrder || 0),
        isActive: slide.isActive,
        animation: slide.animation ?? "fade",
        animationDuration: Number(slide.animationDuration || 600),
      }));
  } catch (error) {
    console.error("Homepage hero load error:", error);
    return [];
  }
}

export default async function Home() {
  const heroSlides = await getHeroSlides();

  return (
    <>
      <HeroCarousel
        fallback={
          heroSlides.length > 0 ? heroSlides : fallbackHeroSlides
        }
      />

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

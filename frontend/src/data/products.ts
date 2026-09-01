export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  isNew?: boolean;
  originalPrice?: number;
  reviewCount?: number;
  description?: string;
  images?: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  materials?: string;
  shipping?: string;
  returns?: string;
}

// Curated gallery images that complement each product
const accessoryGallery = [
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80",
];

const homeGallery = [
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1530603907829-659ab6b5b1c2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80",
];

const apparelGallery = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80",
];

const lifestyleGallery = [
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
];

const beautyGallery = [
  "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1602523498204-6c6fb3e1c4e8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=900&q=80",
];

const defaultShipping =
  "Free standard shipping on orders over $50. Standard delivery arrives in 5–7 business days. Express shipping (2–3 business days) is available at checkout.";
const defaultReturns =
  "Not in love? Return any item within 30 days for a full refund. Items must be unused and in their original packaging. We cover the return label.";

export const products: Product[] = [
  {
    id: "1",
    name: "Elegant Silk Scarf",
    price: 49.99,
    originalPrice: 65.0,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    category: "Accessories",
    rating: 4.5,
    reviewCount: 128,
    description:
      "A timeless silk scarf woven from 100% pure mulberry silk. Lightweight, lustrous and incredibly soft — perfect for dressing up everyday looks or wrapping around a special gift.",
    images: accessoryGallery,
    colors: [
      { name: "Ivory", hex: "#f5efe6" },
      { name: "Rose", hex: "#d4a5a5" },
      { name: "Sage", hex: "#a3b3a0" },
      { name: "Charcoal", hex: "#2d2a26" },
    ],
    materials:
      "100% pure mulberry silk. Hand-rolled hem. Dry clean only. Designed to last for years with proper care.",
    shipping: defaultShipping,
    returns: defaultReturns,
  },
  {
    id: "2",
    name: "Minimalist Leather Wallet",
    price: 79.0,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
    category: "Accessories",
    rating: 4.2,
    reviewCount: 96,
    description:
      "Crafted from full-grain vegetable-tanned leather, this slim wallet is designed for the essentials. Six card slots, a clean billfold and a timeless silhouette.",
    images: accessoryGallery,
    colors: [
      { name: "Tan", hex: "#b08968" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Espresso", hex: "#3e2c1c" },
    ],
    materials:
      "Full-grain vegetable-tanned leather. Hand-stitched seams. Ages beautifully with a natural patina.",
    shipping: defaultShipping,
    returns: defaultReturns,
  },
  {
    id: "3",
    name: "Modern Table Lamp",
    price: 120.5,
    originalPrice: 145.0,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    rating: 4.8,
    reviewCount: 214,
    description:
      "A sculptural table lamp with a brushed brass base and a soft linen shade. Casts a warm, inviting glow that transforms any bedside or desk into a calm retreat.",
    images: homeGallery,
    sizes: ["Small", "Medium", "Large"],
    colors: [
      { name: "Brass", hex: "#c8a165" },
      { name: "Matte Black", hex: "#1a1a1a" },
    ],
    materials:
      "Brushed brass base, 100% linen shade, in-line dimmer switch. E26 bulb sold separately.",
    shipping:
      "Ships in 2 business days with protective packaging. Bulb not included.",
    returns: defaultReturns,
  },
  {
    id: "4",
    name: "Organic Cotton T-Shirt",
    price: 35.0,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    category: "Apparel",
    rating: 4.0,
    reviewCount: 312,
    description:
      "The everyday tee, perfected. Made from soft, breathable organic cotton with a relaxed fit and clean finish. Pairs effortlessly with anything in your closet.",
    images: apparelGallery,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#f5f5f0" },
      { name: "Stone", hex: "#d8d2c4" },
      { name: "Olive", hex: "#6b6b3a" },
      { name: "Navy", hex: "#1f2a44" },
    ],
    materials:
      "100% GOTS-certified organic cotton. Pre-washed for softness. Machine wash cold, tumble dry low.",
    shipping: defaultShipping,
    returns: defaultReturns,
  },
  {
    id: "5",
    name: "Stainless Steel Water Bottle",
    price: 25.99,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    category: "Lifestyle",
    rating: 4.3,
    reviewCount: 421,
    isNew: true,
    description:
      "Double-walled vacuum insulated to keep drinks cold for 24 hours or hot for 12. A leakproof lid, sleek silhouette and a footprint small enough to fit any bag.",
    images: lifestyleGallery,
    sizes: ["16 oz", "24 oz", "32 oz"],
    colors: [
      { name: "Brushed Silver", hex: "#c0c0c0" },
      { name: "Matte Black", hex: "#1a1a1a" },
      { name: "Sand", hex: "#d8c9a8" },
      { name: "Forest", hex: "#2f4f3e" },
    ],
    materials:
      "Food-grade 18/8 stainless steel. BPA-free lid. Dishwasher safe (top rack only).",
    shipping: defaultShipping,
    returns: defaultReturns,
  },
  {
    id: "6",
    name: "Handcrafted Wooden Photo Frame",
    price: 45.0,
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    rating: 4.7,
    reviewCount: 88,
    description:
      "A photo frame carved by hand from solid walnut. Holds a 5x7 print and comes with a soft velvet easel back. A keepsake to treasure.",
    images: homeGallery,
    sizes: ["5x7", "8x10", "11x14"],
    colors: [
      { name: "Walnut", hex: "#5b3a29" },
      { name: "Maple", hex: "#d2b48c" },
    ],
    materials:
      "Solid walnut wood, anti-glare glass front, velvet easel back. Wipe clean with a soft dry cloth.",
    shipping: defaultShipping,
    returns: defaultReturns,
  },
  {
    id: "7",
    name: "Personalized Engraved Necklace",
    price: 60.0,
    originalPrice: 75.0,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
    category: "Jewelry",
    rating: 4.6,
    reviewCount: 167,
    description:
      "A delicate pendant necklace made to be personalized. Choose your initials, a name or a tiny date — each piece is engraved by hand and arrives in a gift-ready box.",
    images: accessoryGallery,
    colors: [
      { name: "Gold", hex: "#d4af37" },
      { name: "Silver", hex: "#c0c0c0" },
      { name: "Rose Gold", hex: "#b76e79" },
    ],
    materials:
      "14k gold-fill, sterling silver or rose gold plating over a brass core. Hypoallergenic. Comes in a velvet pouch and gift box.",
    shipping:
      "Personalized pieces ship within 3 business days. Free shipping on personalized orders over $50.",
    returns:
      "Personalized pieces are final sale. However, if there is a defect in craftsmanship, we will repair or replace the item free of charge.",
  },
  {
    id: "8",
    name: "Luxury Scented Candle Set",
    price: 30.0,
    image:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
    category: "Beauty",
    rating: 4.4,
    reviewCount: 245,
    isNew: true,
    description:
      "A trio of hand-poured soy candles in warm, calming scents. Each one is made with a cotton wick and burns clean for up to 40 hours — perfect for slow evenings.",
    images: beautyGallery,
    sizes: ["Set of 3", "Set of 6"],
    colors: [
      { name: "Vanilla & Cedar", hex: "#e6d2b5" },
      { name: "Rose & Oud", hex: "#d4a5a5" },
      { name: "Citrus & Mint", hex: "#c8e6c9" },
    ],
    materials:
      "100% natural soy wax, cotton wick, phthalate-free fragrance oils. Recyclable glass vessel. 40 hour burn time each.",
    shipping: defaultShipping,
    returns: defaultReturns,
  },
];

export const getProductById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);

export const getRelatedProducts = (
  id: string,
  category: string,
  limit = 4
): Product[] => {
  const sameCategory = products.filter(
    (p) => p.category === category && p.id !== id
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  // backfill with other categories if there aren't enough
  const others = products.filter(
    (p) => p.category !== category && p.id !== id
  );
  return [...sameCategory, ...others].slice(0, limit);
};
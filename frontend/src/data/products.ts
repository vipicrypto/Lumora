export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  isNew?: boolean;
  originalPrice?: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Elegant Silk Scarf",
    price: 49.99,
    originalPrice: 65.0,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    category: "Accessories",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Minimalist Leather Wallet",
    price: 79.0,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    category: "Accessories",
    rating: 4.2,
  },
  {
    id: "3",
    name: "Modern Table Lamp",
    price: 120.5,
    originalPrice: 145.0,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    category: "Home",
    rating: 4.8,
  },
  {
    id: "4",
    name: "Organic Cotton T-Shirt",
    price: 35.0,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    category: "Apparel",
    rating: 4.0,
  },
  {
    id: "5",
    name: "Stainless Steel Water Bottle",
    price: 25.99,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    category: "Lifestyle",
    rating: 4.3,
    isNew: true,
  },
  {
    id: "6",
    name: "Handcrafted Wooden Photo Frame",
    price: 45.0,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
    category: "Home",
    rating: 4.7,
  },
  {
    id: "7",
    name: "Personalized Engraved Necklace",
    price: 60.0,
    originalPrice: 75.0,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    category: "Jewelry",
    rating: 4.6,
  },
  {
    id: "8",
    name: "Luxury Scented Candle Set",
    price: 30.0,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    category: "Beauty",
    rating: 4.4,
    isNew: true,
  },
];
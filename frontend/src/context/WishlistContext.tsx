"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Product } from "../data/products";

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage after the first client render.
  // This keeps server and client rendering consistent.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wishlistItems");

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setWishlistItems(parsed as Product[]);
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save wishlist after localStorage has been loaded.
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      localStorage.setItem(
        "wishlistItems",
        JSON.stringify(wishlistItems)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [wishlistItems, isHydrated]);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      const alreadyExists = prev.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return prev;
      }

      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) =>
      prev.filter((item) => item.id !== productId)
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      const alreadyExists = prev.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return prev.filter((item) => item.id !== product.id);
      }

      return [...prev, product];
    });
  };

  const isWishlisted = (productId: string) => {
    return wishlistItems.some(
      (item) => item.id === productId
    );
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const wishlistCount = useMemo(
    () => wishlistItems.length,
    [wishlistItems]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used within a WishlistProvider"
    );
  }

  return context;
}
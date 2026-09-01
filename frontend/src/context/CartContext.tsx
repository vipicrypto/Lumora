"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Product } from "../data/products";

const CART_STORAGE_KEY = "cartItems";

const MAX_QUANTITY_PER_ITEM = 99;

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  cartItems: CartItem[];

  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string
  ) => void;

  removeFromCart: (cartItemId: string) => void;

  updateQuantity: (
    cartItemId: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  cartItemCount: number;

  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

function createCartItemId(
  productId: string,
  selectedSize?: string,
  selectedColor?: string
) {
  return [
    productId,
    selectedSize?.trim() || "default",
    selectedColor?.trim() || "default",
  ].join("-");
}

function sanitizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.min(
    MAX_QUANTITY_PER_ITEM,
    Math.max(1, Math.floor(quantity))
  );
}

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Partial<CartItem>;

  if (
    typeof candidate.cartItemId !== "string" ||
    typeof candidate.quantity !== "number" ||
    !candidate.product ||
    typeof candidate.product !== "object"
  ) {
    return false;
  }

  const product = candidate.product as Partial<Product>;

  if (
    typeof product.id !== "string" ||
    typeof product.name !== "string" ||
    typeof product.price !== "number" ||
    !Number.isFinite(product.price)
  ) {
    return false;
  }

  if (
    candidate.selectedSize !== undefined &&
    typeof candidate.selectedSize !== "string"
  ) {
    return false;
  }

  if (
    candidate.selectedColor !== undefined &&
    typeof candidate.selectedColor !== "string"
  ) {
    return false;
  }

  return true;
}

function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isValidCartItem)
    .map((item) => ({
      ...item,
      quantity: sanitizeQuantity(item.quantity),
    }));
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  /*
   * Restore the cart after hydration.
   *
   * We intentionally wait until the first client render so the
   * server-rendered HTML and client-rendered HTML remain consistent.
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);

      if (!stored) {
        setIsHydrated(true);
        return;
      }

      const parsed: unknown = JSON.parse(stored);
      const safeCart = sanitizeCartItems(parsed);

      setCartItems(safeCart);
    } catch {
      /*
       * If localStorage contains invalid/corrupted data,
       * start with an empty cart instead of breaking the app.
       */
      setCartItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  /*
   * Persist cart changes only after the original cart has
   * finished loading.
   *
   * This prevents the initial [] state from overwriting an
   * existing customer's saved cart.
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch {
      /*
       * localStorage can fail in private/restricted browser
       * environments. Cart functionality should still continue.
       */
    }
  }, [cartItems, isHydrated]);

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    const safeQuantity = sanitizeQuantity(quantity);

    const cartItemId = createCartItemId(
      product.id,
      selectedSize,
      selectedColor
    );

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItem) {
        return previousItems.map((item) => {
          if (item.cartItemId !== cartItemId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.min(
              MAX_QUANTITY_PER_ITEM,
              item.quantity + safeQuantity
            ),
          };
        });
      }

      return [
        ...previousItems,
        {
          cartItemId,
          product,
          quantity: safeQuantity,
          selectedSize,
          selectedColor,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => item.cartItemId !== cartItemId
      )
    );
  };

  const updateQuantity = (
    cartItemId: string,
    quantity: number
  ) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const safeQuantity = sanitizeQuantity(quantity);

    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartItemCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.product.price);

      if (!Number.isFinite(price) || price < 0) {
        return total;
      }

      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const contextValue = useMemo<CartContextType>(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartItemCount,
      cartSubtotal,
    }),
    [
      cartItems,
      cartItemCount,
      cartSubtotal,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
}
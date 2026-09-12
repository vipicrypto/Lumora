"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Product } from "../data/products";

const GUEST_CART_STORAGE_KEY = "lumora_guest_cart";
const USER_ID_STORAGE_KEY = "lumora_current_user_id";

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

function getCartStorageKey(userId: string | null) {
  if (!userId) {
    return GUEST_CART_STORAGE_KEY;
  }

  return `lumora_cart_${userId}`;
}

function readCart(userId: string | null): CartItem[] {
  try {
    const storageKey = getCartStorageKey(userId);
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return [];
    }

    return sanitizeCartItems(JSON.parse(stored));
  } catch {
    return [];
  }
}

function saveCart(
  userId: string | null,
  items: CartItem[]
) {
  try {
    const storageKey = getCartStorageKey(userId);

    localStorage.setItem(
      storageKey,
      JSON.stringify(items)
    );
  } catch {
    /*
     * localStorage can fail in private/restricted browser
     * environments. Cart functionality should still continue.
     */
  }
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    null
  );
  const [isHydrated, setIsHydrated] = useState(false);

  /*
   * Get the currently authenticated user.
   *
   * The authentication cookie is managed by the server, so
   * the browser cannot reliably read lumora_user_id directly.
   *
   * /api/auth/me is used to determine whether a user is logged in.
   */
  const getCurrentUserId = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      /*
       * Support the common response shapes used by the
       * existing authentication endpoint.
       */
      const userId =
        data?.user?.id ??
        data?.userId ??
        data?.id ??
        null;

      if (
        typeof userId === "string" &&
        userId.trim()
      ) {
        return userId.trim();
      }

      return null;
    } catch {
      return null;
    }
  };

  /*
   * Initial hydration.
   *
   * We first check the authenticated user. Then we load only
   * that user's cart.
   *
   * Guest users use lumora_guest_cart.
   */
  useEffect(() => {
    let cancelled = false;

    const initializeCart = async () => {
      try {
        const userId = await getCurrentUserId();

        if (cancelled) {
          return;
        }

        setCurrentUserId(userId);

        /*
         * Keep the current user id in a non-sensitive localStorage
         * value only for client-side cart bookkeeping.
         *
         * The real authentication remains controlled by the
         * server-side cookie.
         */
        try {
          if (userId) {
            localStorage.setItem(
              USER_ID_STORAGE_KEY,
              userId
            );
          } else {
            localStorage.removeItem(
              USER_ID_STORAGE_KEY
            );
          }
        } catch {
          // Ignore localStorage errors.
        }

        const savedCart = readCart(userId);

        setCartItems(savedCart);
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    };

    initializeCart();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Listen for authentication changes.
   *
   * Login/register/logout pages can dispatch:
   *
   * window.dispatchEvent(new Event("lumora-auth-changed"))
   *
   * The provider will then switch to the correct cart.
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let cancelled = false;

    const handleAuthChange = async () => {
      const userId = await getCurrentUserId();

      if (cancelled) {
        return;
      }

      setCurrentUserId((previousUserId) => {
        /*
         * Nothing changed.
         */
        if (previousUserId === userId) {
          return previousUserId;
        }

        return userId;
      });

      /*
       * IMPORTANT:
       *
       * When the authenticated user changes, load the new
       * user's cart instead of keeping the previous user's cart.
       */
      setCartItems(readCart(userId));

      try {
        if (userId) {
          localStorage.setItem(
            USER_ID_STORAGE_KEY,
            userId
          );
        } else {
          localStorage.removeItem(
            USER_ID_STORAGE_KEY
          );
        }
      } catch {
        // Ignore localStorage errors.
      }
    };

    window.addEventListener(
      "lumora-auth-changed",
      handleAuthChange
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "lumora-auth-changed",
        handleAuthChange
      );
    };
  }, [isHydrated]);

  /*
   * Persist cart changes only after hydration.
   *
   * Each authenticated user gets their own localStorage key.
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveCart(currentUserId, cartItems);
  }, [
    cartItems,
    currentUserId,
    isHydrated,
  ]);

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

    /*
     * Immediately clear the currently active storage key too.
     */
    saveCart(currentUserId, []);
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

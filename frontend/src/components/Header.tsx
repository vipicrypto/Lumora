"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

type SearchProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
};

type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type HeaderProps = {
  initialCategories?: Array<{
    name: string;
    href: string;
  }>;
};

const CATEGORIES = [
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

export const Header: React.FC<HeaderProps> = ({
  initialCategories = [],
}) => {
  const { cartItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();

const [authUser, setAuthUser] =
  useState<AuthUser | null>(null);

const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * Categories are now supplied by the server on the first render.
   * This prevents the old/default category list from flashing while
   * /api/categories is loading.
   */
  const [navLinks, setNavLinks] = useState<
    Array<{ name: string; href: string }>
  >(
    initialCategories.length > 0
      ? initialCategories
      : CATEGORIES
  );

  /*
   * Keep the API refresh so that categories can still be updated
   * after the page has loaded.
   */

  useEffect(() => {
  let cancelled = false;

  async function loadAuthUser() {
    try {
      const response = await fetch(
        "/api/auth/me",
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        if (!cancelled) {
          setAuthUser(null);
        }
        return;
      }

      const data = await response.json();

      if (!cancelled) {
        setAuthUser(
          data?.user
            ? {
                id: String(data.user.id),
                name:
                  data.user.name
                    ? String(data.user.name)
                    : null,
                email: String(data.user.email),
                role: String(data.user.role),
              }
            : null,
        );
      }
    } catch {
      if (!cancelled) {
        setAuthUser(null);
      }
    }
  }

  loadAuthUser();

  const handleAuthChanged = () => {
    loadAuthUser();
  };

  window.addEventListener(
    "lumora-auth-changed",
    handleAuthChanged,
  );

  return () => {
    cancelled = true;

    window.removeEventListener(
      "lumora-auth-changed",
      handleAuthChanged,
    );
  };
}, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/categories", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        const cats = Array.isArray(data?.categories)
          ? data.categories
          : [];

        if (cats.length > 0) {
          setNavLinks(
            cats.map(
              (cat: { name: string; slug?: string }) => ({
                name: cat.name,
                href:
                  "/search?category=" +
                  encodeURIComponent(
                    cat.slug ?? cat.name
                  ),
              })
            )
          );
        }
      })
      .catch(() => {
        /*
         * Only use the hardcoded fallback when the server did not
         * provide initial categories.
         */
        if (initialCategories.length === 0) {
          setNavLinks(CATEGORIES);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialCategories]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(
            query
          )}&limit=6`,
          {
            cache: "no-store",
          }
        );

        if (res.ok) {
          const data = await res.json();

          const products: SearchProduct[] = (
            data.products || []
          ).slice(0, 6);

          setSuggestions(products);
          setShowDropdown(true);
          setActiveIndex(-1);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setSearchQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 250);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!showDropdown) return;

    const totalItems = suggestions.length;

    if (totalItems === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setActiveIndex((prev) =>
        prev < totalItems - 1
          ? prev + 1
          : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : -1
      );
    } else if (
      e.key === "Enter" &&
      activeIndex >= 0
    ) {
      e.preventDefault();

      const product = suggestions[activeIndex];

      if (product) {
        router.push(`/products/${product.id}`);
        setShowDropdown(false);
        setSearchQuery("");
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const handleSuggestionClick = (
    productId: string
  ) => {
    router.push(`/products/${productId}`);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleViewAll = () => {
    const query = searchQuery.trim();

    if (query) {
      router.push(
        `/search?q=${encodeURIComponent(query)}`
      );

      setShowDropdown(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/60">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">

          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#2d2a26] flex items-center justify-center">
              <span className="text-white font-serif text-lg md:text-xl font-bold leading-none">
                L
              </span>
            </div>

            <span className="text-xl md:text-2xl font-serif font-semibold tracking-tight text-[#2d2a26]">
              Lumora
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-6 lg:mx-10">
            <div
              ref={searchRef}
              className="relative w-full"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleViewAll();
                }}
                className="relative w-full"
              >
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  placeholder="Search gifts, categories, occasions..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-sm text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2d2a26]/10 focus:border-[#2d2a26]/30 transition-all"
                />
              </form>

              {showDropdown &&
                searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-50">
                    {isLoading ? (
                      <div className="px-4 py-3 text-sm text-stone-400">
                        Searching...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <>
                        {suggestions.map(
                          (product, index) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() =>
                                handleSuggestionClick(
                                  product.id
                                )
                              }
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                index === activeIndex
                                  ? "bg-stone-50"
                                  : "hover:bg-stone-50"
                              }`}
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                              />

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#1a1a1a] truncate">
                                  {product.name}
                                </p>

                                <p className="text-sm text-[#8b6f5a] font-medium">
                                  {product.price}
                                </p>
                              </div>
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          onClick={handleViewAll}
                          className="w-full px-4 py-2.5 text-sm font-medium text-[#8b6f5a] border-t border-stone-100 hover:bg-stone-50 transition-colors"
                        >
                          View all results
                        </button>
                      </>
                    ) : null}
                  </div>
                )}
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-3">
            <Link
              href="/account"
className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium text-[#2d2a26] hover:text-[#8b6f5a] transition-colors"            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>

<span>
  {authUser
    ? `Welcome, ${
        authUser.name?.trim() ||
        authUser.email.split("@")[0]
      }`
    : "Account"}
</span>            </Link>

            <Link
              href="/wishlist"
className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium text-[#2d2a26] hover:text-[#8b6f5a] transition-colors"            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                />
              </svg>

              <span>Wishlist</span>

              <span className="bg-[#8b6f5a] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] hover:text-[#8b6f5a] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>

              <span className="hidden sm:inline">
                Cart
              </span>

              <span className="bg-[#2d2a26] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar pb-3 -mb-0.5 text-[13px] md:text-sm font-medium text-[#5a5248]">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-[#2d2a26] whitespace-nowrap transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

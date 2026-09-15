"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
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

type NavLink = {
  name: string;
  href: string;
};

type HeaderProps = {
  initialCategories?: NavLink[];
};

export const Header: React.FC<HeaderProps> = ({
  initialCategories = [],
}) => {
  const router = useRouter();

  const { cartItemCount } = useCart();
  const { wishlistCount } = useWishlist();

  /* =========================================================
     STATE
     ========================================================= */

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] =
    useState<SearchProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [loggedIn, setLoggedIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  const [navLinks, setNavLinks] =
    useState<NavLink[]>(initialCategories);
  /* =========================================================
     REFS
     ========================================================= */

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const debounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  /* =========================================================
     LOAD BRANDING
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadSiteLogo() {
      try {
        const response = await fetch(
          `/api/settings/branding?v=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (cancelled) return;

        const logo =
          typeof data?.logo === "string"
            ? data.logo.trim()
            : "";

        setSiteLogo(
          logo.length > 0
            ? `${logo}${
                logo.includes("?") ? "&" : "?"
              }v=${Date.now()}`
            : null
        );
      } catch {
        if (!cancelled) {
          setSiteLogo(null);
        }
      }
    }

    loadSiteLogo();

    const handleBrandingChanged = () => {
      loadSiteLogo();
    };

    window.addEventListener(
      "lumora-branding-changed",
      handleBrandingChanged
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "lumora-branding-changed",
        handleBrandingChanged
      );
    };
  }, []);

  /* =========================================================
     CHECK LOGIN
     ========================================================= */

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        setLoggedIn(response.ok);
      } catch {
        setLoggedIn(false);
      }
    };

    checkLogin();
  }, []);

  /* =========================================================
     LOAD ADMIN CATEGORIES
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setNavLinks([]);
          }

          return;
        }

        const data = await response.json();

        if (cancelled) return;

        const categories = Array.isArray(
          data?.categories
        )
          ? data.categories
          : [];

        const links: NavLink[] = categories
          .filter(
            (category: {
              name?: string;
            }) =>
              Boolean(category?.name?.trim())
          )
          .map(
            (category: {
              name: string;
              slug?: string | null;
            }) => ({
              name: category.name.trim(),
              href:
                "/search?category=" +
                encodeURIComponent(
                  category.slug?.trim() ||
                    category.name.trim()
                ),
            })
          );

        setNavLinks(links);
      } catch {
        if (!cancelled) {
          setNavLinks([]);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     MOBILE BODY LOCK
     ========================================================= */

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* =========================================================
     MOBILE DRAWER ESCAPE
     ========================================================= */

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mobileMenuOpen]);

  /* =========================================================
     GLOBAL SEARCH - FETCH SUGGESTIONS
     ========================================================= */

  const fetchSuggestions = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setShowDropdown(true);

      try {
        const response = await fetch(
          `/api/products?q=${encodeURIComponent(
            trimmedQuery
          )}&limit=6`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data = await response.json();

        const products: SearchProduct[] =
          Array.isArray(data?.products)
            ? data.products.slice(0, 6)
            : [];

        setSuggestions(products);
        setActiveIndex(-1);
      } catch (error) {
        console.error(
          "Global search suggestions error:",
          error
        );

        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* =========================================================
     SEARCH INPUT CHANGE
     ========================================================= */

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setSearchQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsLoading(false);
      return;
    }

    setShowDropdown(true);
    setIsLoading(true);

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 250);
  };

  /* =========================================================
     SEARCH KEYBOARD NAVIGATION
     ========================================================= */

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
      return;
    }

    if (
      !showDropdown ||
      suggestions.length === 0
    ) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((previous) =>
        previous < suggestions.length - 1
          ? previous + 1
          : 0
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((previous) =>
        previous > 0
          ? previous - 1
          : suggestions.length - 1
      );

      return;
    }

    if (
      event.key === "Enter" &&
      activeIndex >= 0
    ) {
      event.preventDefault();

      const product =
        suggestions[activeIndex];

      if (product) {
        router.push(
          `/products/${product.id}`
        );

        setShowDropdown(false);
        setSearchQuery("");
        setActiveIndex(-1);
      }
    }
  };

  /* =========================================================
     SEARCH SUGGESTION CLICK
     ========================================================= */

  const handleSuggestionClick = (
    productId: string
  ) => {
    router.push(
      `/products/${productId}`
    );

    setShowDropdown(false);
    setSearchQuery("");
    setActiveIndex(-1);
  };

  /* =========================================================
     VIEW ALL SEARCH RESULTS
     ========================================================= */

  const handleViewAll = () => {
    const query = searchQuery.trim();

    if (!query) return;

    setMobileMenuOpen(false);
    setShowDropdown(false);
    setSearchQuery("");
    setActiveIndex(-1);

    router.push(
      `/search?q=${encodeURIComponent(query)}`
    );
  };

  /* =========================================================
     SEARCH SUBMIT
     ========================================================= */

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    handleViewAll();
  };

  /* =========================================================
     CLOSE SEARCH OUTSIDE CLICK
     ========================================================= */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target = event.target as Node;

      const insideDesktop =
        desktopSearchRef.current?.contains(
          target
        );

      const insideMobile =
        mobileSearchRef.current?.contains(
          target
        );

      if (
        !insideDesktop &&
        !insideMobile
      ) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     CLEANUP SEARCH DEBOUNCE
     ========================================================= */

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch(
        "/api/logout",
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setLoggedIn(false);
        setMobileMenuOpen(false);

        window.dispatchEvent(
          new Event("lumora-auth-changed")
        );

        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      setLoggingOut(false);
    }
  };

  /* =========================================================
     MOBILE LINK CLICK
     ========================================================= */

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  /* =========================================================
     SEARCH DROPDOWN COMPONENT
     ========================================================= */

  const searchDropdown = (
    <div className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
      {isLoading ? (
        <div className="px-4 py-4 text-sm text-stone-400">
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
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === activeIndex
                    ? "bg-stone-100"
                    : "hover:bg-stone-50"
                }`}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-11 w-11 shrink-0 rounded-lg bg-stone-100 object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-xs text-stone-400">
                    No image
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1a1a1a]">
                    {product.name}
                  </p>

                  <p className="mt-0.5 text-sm font-medium text-[#8b6f5a]">
                    {product.price}
                  </p>
                </div>
              </button>
            )
          )}

          <button
            type="button"
            onClick={handleViewAll}
            className="w-full border-t border-stone-100 px-4 py-3 text-sm font-medium text-[#8b6f5a] transition-colors hover:bg-stone-50"
          >
            View all results
          </button>
        </>
      ) : (
        <div className="px-4 py-4">
          <p className="text-sm text-stone-500">
            No products found
          </p>

          <button
            type="button"
            onClick={handleViewAll}
            className="mt-2 text-sm font-medium text-[#8b6f5a] hover:underline"
          >
            View all results
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* =====================================================
          HEADER
         ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6 lg:px-10">

          {/* =================================================
              MOBILE HEADER
             ================================================= */}

          <div className="md:hidden">

            {/* Mobile top bar */}
            <div className="flex h-[60px] items-center justify-between">

              {/* Hamburger */}
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                aria-label="Open menu"
                aria-expanded={
                  mobileMenuOpen
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#2d2a26] transition-colors active:bg-stone-100"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    d="M4 7h16"
                  />

                  <path
                    strokeLinecap="round"
                    d="M4 12h16"
                  />

                  <path
                    strokeLinecap="round"
                    d="M4 17h16"
                  />
                </svg>
              </button>

              {/* Mobile Logo */}
              <Link
                href="/"
                aria-label="Lumora home"
                className="flex min-w-0 flex-1 items-center justify-center px-3"
              >
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt="Lumora"
                    className="h-9 max-w-[150px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d2a26]">
                      <span className="font-serif text-lg font-bold leading-none text-white">
                        L
                      </span>
                    </div>

                    <span className="font-serif text-xl font-semibold tracking-tight text-[#2d2a26]">
                      Lumora
                    </span>
                  </div>
                )}
              </Link>

              {/* Mobile actions */}
              <div className="flex shrink-0 items-center gap-0.5">

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  aria-label={`Wishlist (${wishlistCount})`}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#2d2a26] transition-colors active:bg-stone-100"
                >
                  <svg
                    className="h-[21px] w-[21px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                    />
                  </svg>

                  {wishlistCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#8b6f5a] px-1 text-[9px] font-bold leading-none text-white">
                      {wishlistCount > 99
                        ? "99+"
                        : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  aria-label={`Cart (${cartItemCount})`}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#2d2a26] transition-colors active:bg-stone-100"
                >
                  <svg
                    className="h-[21px] w-[21px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 7h12l1 13H5L6 7z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 7V5a3 3 0 016 0v2"
                    />
                  </svg>

                  {cartItemCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#2d2a26] px-1 text-[9px] font-bold leading-none text-white">
                      {cartItemCount > 99
                        ? "99+"
                        : cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Search */}
            <div
              ref={mobileSearchRef}
              className="relative pb-3"
            >
              <form
                onSubmit={handleSearch}
                className="relative"
              >
                <svg
                  className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                  />
                </svg>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={
                    handleSearchKeyDown
                  }
                  onFocus={() => {
                    if (
                      searchQuery.trim()
                        .length >= 2
                    ) {
                      setShowDropdown(true);
                    }
                  }}
                  autoComplete="off"
                  placeholder="Search gifts, categories..."
                  className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-[13px] text-[#1a1a1a] outline-none transition-all placeholder:text-stone-400 focus:border-[#2d2a26]/25 focus:bg-white focus:ring-2 focus:ring-[#2d2a26]/5"
                />
              </form>

              {showDropdown &&
                searchQuery.trim()
                  .length >= 2 && (
                  <div className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
                    {isLoading ? (
                      <div className="px-4 py-4 text-sm text-stone-400">
                        Searching...
                      </div>
                    ) : suggestions.length >
                      0 ? (
                      <>
                        {suggestions.map(
                          (
                            product,
                            index
                          ) => (
                            <button
                              key={
                                product.id
                              }
                              type="button"
                              onClick={() =>
                                handleSuggestionClick(
                                  product.id
                                )
                              }
                              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                index ===
                                activeIndex
                                  ? "bg-stone-100"
                                  : "active:bg-stone-50"
                              }`}
                            >
                              {product.image ? (
                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="h-11 w-11 shrink-0 rounded-lg bg-stone-100 object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-xs text-stone-400">
                                  No image
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[#1a1a1a]">
                                  {
                                    product.name
                                  }
                                </p>

                                <p className="mt-0.5 text-sm font-medium text-[#8b6f5a]">
                                  {
                                    product.price
                                  }
                                </p>
                              </div>
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          onClick={
                            handleViewAll
                          }
                          className="w-full border-t border-stone-100 px-4 py-3 text-sm font-semibold text-[#8b6f5a] active:bg-stone-50"
                        >
                          View all results
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-4">
                        <p className="text-sm text-stone-500">
                          No products found
                        </p>

                        <button
                          type="button"
                          onClick={
                            handleViewAll
                          }
                          className="mt-2 text-sm font-medium text-[#8b6f5a] hover:underline"
                        >
                          View all results
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* =================================================
              DESKTOP / TABLET HEADER
             ================================================= */}

          <div className="hidden md:block">

            <div className="flex h-20 items-center justify-between">

              {/* Desktop Logo */}
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2.5"
              >
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt="Lumora"
                    className="h-10 w-auto max-w-[180px] object-contain"
                  />
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d2a26]">
                      <span className="font-serif text-xl font-bold leading-none text-white">
                        L
                      </span>
                    </div>

                    <span className="font-serif text-2xl font-semibold tracking-tight text-[#2d2a26]">
                      Lumora
                    </span>
                  </>
                )}
              </Link>

              {/* Desktop Search */}
              <div
                ref={desktopSearchRef}
                className="relative mx-6 flex max-w-xl flex-1 lg:mx-10"
              >
                <form
                  onSubmit={handleSearch}
                  className="relative w-full"
                >
                  <svg
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={
                      handleSearchChange
                    }
                    onKeyDown={
                      handleSearchKeyDown
                    }
                    onFocus={() => {
                      if (
                        searchQuery.trim()
                          .length >= 2
                      ) {
                        setShowDropdown(true);
                      }
                    }}
                    autoComplete="off"
                    placeholder="Search gifts, categories, occasions..."
                    className="w-full rounded-full border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-[#1a1a1a] placeholder:text-stone-400 transition-all focus:border-[#2d2a26]/30 focus:outline-none focus:ring-2 focus:ring-[#2d2a26]/10"
                  />
                </form>

                {showDropdown &&
                  searchQuery.trim()
                    .length >= 2 &&
                  searchDropdown}
              </div>

              {/* Desktop Actions */}
              <nav className="flex shrink-0 items-center gap-1 md:gap-3">

                {/* Account */}
                {loggedIn ? (
                  <Link
                    href="/account"
                    className="hidden items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] transition-colors hover:text-[#8b6f5a] sm:flex"
                  >
                    <svg
                      className="h-4 w-4"
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
                      Profile
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="hidden items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] transition-colors hover:text-[#8b6f5a] sm:flex"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 21a7 7 0 0114 0"
                      />
                    </svg>

                    <span>
                      Sign In
                    </span>
                  </Link>
                )}

                {/* Orders */}
                {loggedIn && (
                  <Link
                    href="/orders"
                    className="hidden items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] transition-colors hover:text-[#8b6f5a] lg:flex"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5h6M9 9h6M9 13h4M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"
                      />
                    </svg>

                    <span>
                      Orders
                    </span>
                  </Link>
                )}

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className="hidden items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] transition-colors hover:text-[#8b6f5a] sm:flex"
                >
                  <svg
                    className="h-4 w-4"
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

                  <span>
                    Wishlist
                  </span>

                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#8b6f5a] text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] transition-colors hover:text-[#8b6f5a]"
                >
                  <svg
                    className="h-4 w-4"
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

                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2d2a26] text-[10px] font-bold text-white">
                    {cartItemCount}
                  </span>
                </Link>

                {/* Logout */}
                {loggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="hidden items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d2a26] transition-colors hover:text-red-700 disabled:opacity-50 md:flex"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 17l5-5-5-5M15 12H3"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 19V5a2 2 0 00-2-2h-6"
                      />
                    </svg>

                    <span>
                      {loggingOut
                        ? "Signing Out..."
                        : "Logout"}
                    </span>
                  </button>
                )}
              </nav>
            </div>

            {/* =================================================
                ADMIN CATEGORY MENU
               ================================================= */}

            {navLinks.length > 0 && (
              <nav className="no-scrollbar -mb-0.5 flex items-center gap-6 overflow-x-auto pb-3 text-[13px] font-medium text-[#5a5248] md:gap-8 md:text-sm">
                {navLinks.map((link) => (
                  <Link
                    key={`${link.name}-${link.href}`}
                    href={link.href}
                    className="whitespace-nowrap transition-colors hover:text-[#2d2a26]"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* =======================================================
          MOBILE OFF-CANVAS DRAWER
         ======================================================= */}

      <div
        className={`fixed inset-0 z-[100] md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className={`absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileMenuOpen
              ? "opacity-100"
              : "opacity-0"
          }`}
        />

        {/* Drawer */}
        <aside
          className={`absolute left-0 top-0 flex h-full w-[min(86vw,360px)] flex-col bg-[#fffdf9] shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-stone-200 px-5">
            <Link
              href="/"
              onClick={
                handleMobileLinkClick
              }
              className="flex items-center gap-2"
            >
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt="Lumora"
                  className="h-9 max-w-[150px] object-contain"
                />
              ) : (
                <>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d2a26]">
                    <span className="font-serif text-lg font-bold leading-none text-white">
                      L
                    </span>
                  </div>

                  <span className="font-serif text-xl font-semibold tracking-tight text-[#2d2a26]">
                    Lumora
                  </span>
                </>
              )}
            </Link>

            {/* Close */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#2d2a26] transition-colors active:bg-stone-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  d="M6 6l12 12"
                />

                <path
                  strokeLinecap="round"
                  d="M18 6L6 18"
                />
              </svg>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">

            {/* Account Summary */}
            <div className="mb-5 rounded-2xl bg-stone-100/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2d2a26]">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 21a8 8 0 00-16 0"
                    />

                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    {loggedIn
                      ? "Your account"
                      : "Welcome to Lumora"}
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold text-[#2d2a26]">
                    {loggedIn
                      ? "Manage your account"
                      : "Sign in for a better experience"}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                {loggedIn ? (
                  <Link
                    href="/account"
                    onClick={
                      handleMobileLinkClick
                    }
                    className="text-xs font-semibold text-[#8b6f5a]"
                  >
                    View Profile →
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={
                      handleMobileLinkClick
                    }
                    className="text-xs font-semibold text-[#8b6f5a]"
                  >
                    Sign In →
                  </Link>
                )}
              </div>
            </div>

            {/* Admin Categories */}
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={`mobile-${link.name}-${link.href}`}
                  href={link.href}
                  onClick={
                    handleMobileLinkClick
                  }
                  className="flex min-h-[48px] items-center justify-between rounded-xl px-3 text-[15px] font-medium text-[#2d2a26] transition-colors active:bg-stone-100"
                >
                  <span>
                    {link.name}
                  </span>

                  <svg
                    className="h-4 w-4 text-stone-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 18l6-6-6-6"
                    />
                  </svg>
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="my-5 h-px bg-stone-200" />

            {/* Quick Actions */}
            <nav className="space-y-1">

              {/* Wishlist */}
              <Link
                href="/wishlist"
                onClick={
                  handleMobileLinkClick
                }
                className="flex min-h-[48px] items-center justify-between rounded-xl px-3 text-[15px] font-medium text-[#2d2a26] active:bg-stone-100"
              >
                <span className="flex items-center gap-3">
                  <svg
                    className="h-[19px] w-[19px] text-stone-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                    />
                  </svg>

                  Wishlist
                </span>

                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#8b6f5a] px-1.5 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                onClick={
                  handleMobileLinkClick
                }
                className="flex min-h-[48px] items-center justify-between rounded-xl px-3 text-[15px] font-medium text-[#2d2a26] active:bg-stone-100"
              >
                <span className="flex items-center gap-3">
                  <svg
                    className="h-[19px] w-[19px] text-stone-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>

                  Cart
                </span>

                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2d2a26] px-1.5 text-[10px] font-bold text-white">
                  {cartItemCount}
                </span>
              </Link>

              {/* Orders */}
              {loggedIn && (
                <Link
                  href="/orders"
                  onClick={
                    handleMobileLinkClick
                  }
                  className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-[#2d2a26] active:bg-stone-100"
                >
                  <svg
                    className="h-[19px] w-[19px] text-stone-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5h6M9 9h6M9 13h4M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"
                    />
                  </svg>

                  Orders
                </Link>
              )}
            </nav>
          </div>

          {/* Drawer Footer */}
          <div className="shrink-0 border-t border-stone-200 px-5 py-4">
            {loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-[#2d2a26] transition-colors active:bg-stone-100 disabled:opacity-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 17l5-5-5-5M15 12H3"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 19V5a2 2 0 00-2-2h-6"
                  />
                </svg>

                {loggingOut
                  ? "Signing Out..."
                  : "Logout"}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={
                  handleMobileLinkClick
                }
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#2d2a26] text-sm font-semibold text-white transition-transform active:scale-[0.98]"
              >
                Sign In
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Constants
const SCROLL_THRESHOLD = 80;
const NAVIGATION_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Rượu vang" },
  { href: "/accessories", label: "Phụ kiện" },
  { href: "/gifts", label: "Quà tặng" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/contact", label: "Liên hệ" },
  { href: "/history", label: "Lịch sử đặt hàng" },
];

const WINE_TYPES = [
  { type: "red", label: "Rượu Vang Đỏ" },
  { type: "white", label: "Rượu Vang Trắng" },
  { type: "rose", label: "Rượu Vang Hồng" },
  { type: "sparkling", label: "Rượu Vang Sủi" },
];

const ACCESSORY_TYPES_MENU = [
  { key: "decanter", label: "Bình thở" },
  { key: "goblet", label: "Ly rượu" },
  { key: "opener", label: "Dụng cụ mở rượu" },
];

const SearchComponent = ({
  isMobile = false,
  isSearching = false,
  searchTerm = "",
  setSearchTerm = () => {},
  onSearch = () => {},
}: {
  isMobile?: boolean;
  isSearching?: boolean;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  onSearch?: () => void;
}) => (
  <div className={isMobile ? "w-full" : "hidden md:flex flex-1 mx-8 max-w-md"}>
    <div className="relative w-full flex items-stretch">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4 pr-4 py-2 w-full rounded-r-none h-full"
          disabled={isSearching}
          aria-label="Tìm kiếm sản phẩm"
          autoComplete="off"
          spellCheck="false"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearch();
            }
          }}
        />
      </div>
      <Button
        type="button"
        onClick={onSearch}
        disabled={isSearching || !searchTerm.trim()}
        className="bg-red-600 hover:bg-red-700 text-white px-4 rounded-l-none border-l-0 h-auto flex items-center justify-center"
        aria-label="Tìm kiếm"
      >
        {isSearching ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </div>
  </div>
);

export default function Header() {
  const { state } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNav, setShowNav] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isAccessoriesOpen, setIsAccessoriesOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileAccessoriesOpen, setMobileAccessoriesOpen] = useState(false);
  const lastScrollY = useRef(0);
  const router = useRouter();

  // Memoized values
  const cartItemCount = useMemo(() => state.itemCount, [state.itemCount]);
  const isUserLoggedIn = useMemo(() => !!user, [user]);
  const isUserAdmin = useMemo(() => !!user?.isAdmin, [user?.isAdmin]);

  // Scroll handler with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;

          if (
            currentScroll > lastScrollY.current &&
            currentScroll > SCROLL_THRESHOLD
          ) {
            setShowNav(false);
          } else {
            setShowNav(true);
          }

          lastScrollY.current = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search handler
  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedSearch = searchTerm.trim();

      if (!trimmedSearch) return;

      setIsSearching(true);
      try {
        await router.push(
          `/products?search=${encodeURIComponent(trimmedSearch)}`
        );
        setMobileMenuOpen(false);
      } catch (error) {
        console.error("Search navigation error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [searchTerm, router]
  );

  // Search button handler
  const handleSearchClick = useCallback(async () => {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) return;

    setIsSearching(true);
    try {
      await router.push(
        `/products?search=${encodeURIComponent(trimmedSearch)}`
      );
      setMobileMenuOpen(false);
      setSearchTerm("");
    } catch (error: any) {
      console.error("Search navigation error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, router]);

  // Link click handler
  const handleLinkClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    logout();
    setMobileMenuOpen(false);
  }, [logout]);

  // Mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  // Logo component
  const Logo = () => (
    <Link
      href="/"
      className="flex items-center space-x-2"
      aria-label="Trang chủ"
    >
      <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">W</span>
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white">
        WineVault
      </span>
    </Link>
  );

  // Search component

  // Cart button component
  const CartButton = () => (
    <Link href="/cart" className="relative" aria-label="Giỏ hàng">
      <Button variant="ghost" size="sm" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {cartItemCount > 0 && (
          <span
            className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            aria-label={`${cartItemCount} sản phẩm trong giỏ hàng`}
          >
            {cartItemCount}
          </span>
        )}
      </Button>
    </Link>
  );

  // User actions component
  const UserActions = () => (
    <>
      {isUserLoggedIn ? (
        <div className="flex items-center space-x-2 hidden md:flex">
          <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
            {user?.name}
          </span>
          {isUserAdmin && (
            <Link href="/admin" aria-label="Trang quản trị">
              <Button variant="ghost" size="sm">
                Admin
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden sm:block"
            aria-label="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Link className="hidden md:flex" href="/auth" aria-label="Đăng nhập">
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Đăng nhập
          </Button>
        </Link>
      )}
    </>
  );

  // Mobile menu button
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="sm"
      className="md:hidden"
      onClick={toggleMobileMenu}
      aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
      aria-expanded={mobileMenuOpen}
    >
      {mobileMenuOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  );

  // Navigation links component
  const NavigationLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav
      className={
        isMobile
          ? "flex-1 flex flex-col space-y-2 p-4"
          : "flex justify-center items-center space-x-8 h-10"
      }
    >
      {NAVIGATION_ITEMS.map((item) => {
        // Mobile expandable: Products
        if (isMobile && item.href === "/products") {
          return (
            <div key={item.href} className="flex flex-col">
              <button
                type="button"
                onClick={() => setMobileProductsOpen((v) => !v)}
                className="w-full text-left flex items-center justify-between py-2 text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400"
                aria-expanded={mobileProductsOpen}
                aria-controls="mobile-products-submenu"
              >
                <span>Rượu vang</span>
                {mobileProductsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {mobileProductsOpen && (
                <div
                  id="mobile-products-submenu"
                  className="ml-3 border-l border-gray-200 dark:border-gray-700 pl-3 space-y-1"
                >
                  {WINE_TYPES.map(({ type, label }) => (
                    <Link
                      key={type}
                      href={`/products?type=${type}`}
                      onClick={handleLinkClick}
                      className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400"
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <Link
                      href="/products"
                      onClick={handleLinkClick}
                      className="block py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Xem tất cả rượu vang
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Mobile expandable: Accessories
        if (isMobile && item.href === "/accessories") {
          return (
            <div key={item.href} className="flex flex-col">
              <button
                type="button"
                onClick={() => setMobileAccessoriesOpen((v) => !v)}
                className="w-full text-left flex items-center justify-between py-2 text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400"
                aria-expanded={mobileAccessoriesOpen}
                aria-controls="mobile-accessories-submenu"
              >
                <span>Phụ kiện</span>
                {mobileAccessoriesOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {mobileAccessoriesOpen && (
                <div
                  id="mobile-accessories-submenu"
                  className="ml-3 border-l border-gray-200 dark:border-gray-700 pl-3 space-y-1"
                >
                  {ACCESSORY_TYPES_MENU.map(({ key, label }) => (
                    <Link
                      key={key}
                      href={`/accessories?type=${encodeURIComponent(key)}`}
                      onClick={handleLinkClick}
                      className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400"
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <Link
                      href="/accessories"
                      onClick={handleLinkClick}
                      className="block py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Xem tất cả phụ kiện
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        }

        if (!isMobile && item.href === "/products") {
          return (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <Link href={item.href} className="nav-link">
                {item.label}
              </Link>
              {isProductsOpen && (
                <>
                  {/* Hover bridge to prevent gap losing hover */}
                  <div className="absolute top-full left  w-64 h-3" />
                  <div className="absolute top-full left  mt-3 z-[100]">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-2 w-64">
                      <div className="py-1">
                        {WINE_TYPES.map(({ type, label }) => (
                          <Link
                            key={type}
                            href={`/products?type=${type}`}
                            className="block px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-red-400"
                          >
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                          <Link
                            href="/products"
                            className="block px-3 py-2 rounded-md text-sm font-medium text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-800 dark:hover:text-red-300"
                          >
                            Xem tất cả rượu vang
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        }

        if (!isMobile && item.href === "/accessories") {
          return (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => setIsAccessoriesOpen(true)}
              onMouseLeave={() => setIsAccessoriesOpen(false)}
            >
              <Link href={item.href} className="nav-link">
                {item.label}
              </Link>
              {isAccessoriesOpen && (
                <>
                  {/* Hover bridge for accessories dropdown */}
                  <div className="absolute top-full left w-64 h-3" />
                  <div className="absolute top-full left mt-3 z-[100]">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-2 w-64">
                      <div className="py-1">
                        {ACCESSORY_TYPES_MENU.map(({ key, label }) => (
                          <Link
                            key={key}
                            href={`/accessories?type=${key}`}
                            className="block px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-red-400"
                          >
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                          <Link
                            href="/accessories"
                            className="block px-3 py-2 rounded-md text-sm font-medium text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-800 dark:hover:text-red-300"
                          >
                            Xem tất cả phụ kiện
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isMobile
                ? "text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
                : "nav-link"
            }
            onClick={isMobile ? handleLinkClick : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Main Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-[90] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <SearchComponent
              isSearching={isSearching}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearchClick}
            />

            <div className="flex items-center space-x-4">
              <CartButton />
              <UserActions />
              <MobileMenuButton />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav
        className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-transform duration-300 md:block hidden sticky top-16 z-[85] ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-label="Điều hướng chính"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <NavigationLinks />
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-[95] md:hidden border-r border-gray-200 dark:border-gray-800`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <Logo />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search in sidebar */}
          <div className="p-4">
            <SearchComponent
              isMobile
              isSearching={isSearching}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearchClick}
            />
          </div>

          {/* Navigation in sidebar */}
          <NavigationLinks isMobile />

          {/* User actions in sidebar */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            {isUserLoggedIn ? (
              <>
                {isUserAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2 block"
                    onClick={handleLinkClick}
                  >
                    Admin
                  </Link>
                )}
                <button
                  className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2 text-left w-full"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2 block"
                onClick={handleLinkClick}
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[90] md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}

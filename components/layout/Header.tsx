"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, User, LogOut, Menu, X, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const { state } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);
  const router = useRouter();

  // Ẩn/hiện Desktop Navigation khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScrollY.current && currentScroll > 80) {
        // Cuộn xuống
        setShowNav(false);
      } else {
        // Cuộn lên
        setShowNav(true);
      }

      lastScrollY.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Header chính */}
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                WineVault
              </span>
            </Link>

            {/* Tìm kiếm Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 mx-8 max-w-md"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>

            {/* Nút hành động */}
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {state.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {state.itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {user ? (
                <div className="flex items-center space-x-2 hidden md:flex">
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user.name}
                  </span>
                  {!!user.isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="hidden sm:block"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link className="hidden md:flex" href="/auth">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Đăng nhập
                  </Button>
                </Link>
              )}

              {/* Mobile menu */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav
        className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-transform duration-300 md:block hidden sticky top-16 z-40 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-center items-center space-x-8 h-10">
            <Link href="/" className="nav-link">
              Trang chủ
            </Link>
            <Link href="/products" className="nav-link">
              Sản phẩm
            </Link>
            <Link href="/about" className="nav-link">
              Giới thiệu
            </Link>
            <Link href="/contact" className="nav-link">
              Liên hệ
            </Link>
            <Link href="/history" className="nav-link">
              Lịch sử đặt hàng
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 md:hidden border-r border-gray-200 dark:border-gray-800`}
      >
        <div className="flex flex-col h-full">
          {/* Header của sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                WineVault
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tìm kiếm trong sidebar */}
          <div className="p-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>
          </div>

          {/* Menu điều hướng */}
          <nav className="flex-1 flex flex-col space-y-2 p-4">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
              onClick={handleLinkClick}
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
              onClick={handleLinkClick}
            >
              Sản phẩm
            </Link>
            <Link
              href="/about"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
              onClick={handleLinkClick}
            >
              Giới thiệu
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
              onClick={handleLinkClick}
            >
              Liên hệ
            </Link>
            <Link
              href="/history"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
              onClick={handleLinkClick}
            >
              Lịch sử đặt hàng
            </Link>
            {user ? (
              <>
                {!!user.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
                    onClick={handleLinkClick}
                  >
                    Admin
                  </Link>
                )}
                <button
                  className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2 text-left"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
                onClick={handleLinkClick}
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Overlay khi sidebar mở */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

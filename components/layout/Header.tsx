"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { state } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors"
            >
              Sản phẩm
            </Link>
            <Link
              href="/about"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors"
            >
              Giới thiệu
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors"
            >
              Liên hệ
            </Link>
            <Link
              href="/history"
              className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors"
            >
              Lịch sử đặt hàng
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
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

            {/* User menu */}
            {user ? (
              <div className="flex items-center space-x-2">
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
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                href="/products"
                className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                href="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Giới thiệu
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liên hệ
              </Link>
              <Link
                href="/history"
                className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Lịch sử đơn hàng
              </Link>
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors py-2"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                Đăng xuất
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

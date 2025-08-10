"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accessory } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

interface AccessoryCardProps {
  accessory: Accessory;
  variant?: "default" | "compact";
}

export const AccessoryCard: React.FC<AccessoryCardProps> = ({
  accessory,
  variant = "default",
}) => {
  const { addAccessory } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    setTimeout(() => {
      addAccessory(accessory);
      setIsLoading(false);
    }, 300);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (variant === "compact") {
    return (
      <Link href={`/accessories/${accessory.id}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <div className="relative w-16 h-20 flex-shrink-0">
              <Image
                src={accessory.images[0]}
                alt={accessory.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {accessory.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {accessory.accessoryType} • {accessory.brand}
              </p>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                {formatPrice(accessory.price)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 group overflow-hidden">
      <Link href={`/accessories/${accessory.id}`}>
        <div className="relative">
          <div className="aspect-[3/4] relative overflow-hidden">
            <Image
              src={accessory.images[0]}
              alt={accessory.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {accessory.originalPrice &&
              accessory.originalPrice > accessory.price && (
                <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                  Sale
                </Badge>
              )}
            {accessory.featured && (
              <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                Nổi bật
              </Badge>
            )}
            {!accessory.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Badge variant="secondary" className="bg-gray-600 text-white">
                  Hết hàng
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {accessory.accessoryType}
          </Badge>
          {accessory.brand && (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {accessory.brand}
            </span>
          )}
        </div>

        <Link href={`/accessories/${accessory.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-2">
            {accessory.name}
          </h3>
        </Link>

        <div className="space-y-1 mb-2">
          {accessory.material && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chất liệu: {accessory.material}
            </p>
          )}
          {accessory.color && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Màu sắc: {accessory.color}
            </p>
          )}
          {accessory.size && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kích thước: {accessory.size}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatPrice(accessory.price)}
            </span>
            {accessory.originalPrice &&
              accessory.originalPrice > accessory.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(accessory.originalPrice)}
                </span>
              )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!accessory.inStock || isLoading}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

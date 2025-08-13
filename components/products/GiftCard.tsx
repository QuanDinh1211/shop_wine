"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface GiftCardProps {
  gift: Gift;
  variant?: "default" | "compact";
}

export default function GiftCard({ gift, variant = "default" }: GiftCardProps) {
  const { addGift } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setTimeout(() => {
      addGift(gift);
      setIsLoading(false);
    }, 300);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  if (variant === "compact") {
    return (
      <Link href={`/gifts/${gift.id}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <div className="relative w-16 h-20 flex-shrink-0">
              <Image
                src={gift.images?.[0] || "/placeholder-accessory.jpg"}
                alt={gift.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {gift.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {gift.giftType === "set"
                  ? "Set quà"
                  : gift.giftType === "single"
                  ? "1 chai"
                  : "Combo"}
                {gift.theme && ` • ${gift.theme}`}
              </p>
              <div className="flex items-center mt-1">
                <Badge
                  variant="secondary"
                  className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                >
                  {gift.giftType === "set"
                    ? "Set quà"
                    : gift.giftType === "single"
                    ? "1 chai"
                    : "Combo"}
                </Badge>
                {gift.includeWine && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-1"
                  >
                    Kèm rượu
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                {formatPrice(gift.price)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 group overflow-hidden">
      <Link href={`/gifts/${gift.id}`}>
        <div className="relative">
          <div className="aspect-[3/4] relative overflow-hidden">
            <Image
              src={gift.images?.[0] || "/placeholder-accessory.jpg"}
              alt={gift.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {gift.originalPrice && gift.originalPrice > gift.price && (
              <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                Sale
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          >
            {gift.giftType === "set"
              ? "Set quà"
              : gift.giftType === "single"
              ? "1 chai"
              : "Combo"}
          </Badge>
          {gift.includeWine && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Kèm rượu
            </Badge>
          )}
        </div>

        <Link href={`/gifts/${gift.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-2">
            {gift.name}
          </h3>
        </Link>

        {gift.theme && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Chủ đề: {gift.theme}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatPrice(gift.price)}
            </span>
            {gift.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(gift.originalPrice)}
              </span>
            )}
          </div>

          <Button
            onClick={handleAdd}
            disabled={!gift.inStock || isLoading}
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
}

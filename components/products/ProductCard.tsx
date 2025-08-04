'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Wine } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  wine: Wine;
  variant?: 'default' | 'compact';
}

export default function ProductCard({ wine, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    
    setTimeout(() => {
      addItem(wine);
      setIsLoading(false);
    }, 300);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'red':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'white':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rose':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'sparkling':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'red':
        return 'Đỏ';
      case 'white':
        return 'Trắng';
      case 'rose':
        return 'Hồng';
      case 'sparkling':
        return 'Sủi bọt';
      default:
        return type;
    }
  };

  if (variant === 'compact') {
    return (
      <Link href={`/products/${wine.id}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <div className="relative w-16 h-20 flex-shrink-0">
              <Image
                src={wine.images[0]}
                alt={wine.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {wine.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {wine.winery} • {wine.year}
              </p>
              <div className="flex items-center mt-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">
                  {wine.rating}
                </span>
              </div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                {formatPrice(wine.price)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 group overflow-hidden">
      <Link href={`/products/${wine.id}`}>
        <div className="relative">
          <div className="aspect-[3/4] relative overflow-hidden">
            <Image
              src={wine.images[0]}
              alt={wine.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {wine.originalPrice && (
              <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                Sale
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className={getTypeColor(wine.type)}>
            {getTypeName(wine.type)}
          </Badge>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
              {wine.rating} ({wine.reviews})
            </span>
          </div>
        </div>

        <Link href={`/products/${wine.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-2">
            {wine.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {wine.winery} • {wine.country} • {wine.year}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatPrice(wine.price)}
            </span>
            {wine.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(wine.originalPrice)}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!wine.inStock || isLoading}
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
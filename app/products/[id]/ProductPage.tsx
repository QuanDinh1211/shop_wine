"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Wine } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import ProductCard from "@/components/products/ProductCard";

export default function ProductPage({ id }: { id: string }) {
  const { addItem } = useCart();
  const [wine, setWine] = useState<Wine | null>(null);
  const [relatedWines, setRelatedWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchWine() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/wines/${id}`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) {
          if (res.status === 404) {
            notFound();
          }
          throw new Error("Không thể lấy thông tin sản phẩm");
        }
        const data = await res.json();
        setWine(data.wine);
        setRelatedWines(data.relatedWines);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchWine();
  }, [id]);

  const handleAddToCart = async () => {
    if (!wine) return;
    setIsAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        addItem(wine);
      }
      toast.success(`Đã thêm ${quantity} chai ${wine.name} vào giỏ hàng`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "red":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "white":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rose":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      case "sparkling":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeName = (type: string) => {
    switch (type.toLowerCase()) {
      case "red":
        return "Rượu vang đỏ";
      case "white":
        return "Rượu vang trắng";
      case "rose":
        return "Rượu vang hồng";
      case "sparkling":
        return "Rượu sủi bọt";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8 animate-pulse">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <span>/</span>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <span>/</span>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-4 animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md"
                  ></div>
                ))}
              </div>
            </div>
            <div className="space-y-6 animate-pulse">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex space-x-4">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/products"
            className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách sản phẩm
          </Link>
          <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-red-600 text-2xl font-semibold mb-2">
              Ôi không, có lỗi xảy ra!
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!wine) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400">
            Trang chủ
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-red-600 dark:hover:text-red-400"
          >
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white truncate">
            {wine.name}
          </span>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách sản phẩm
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <Image
                src={wine.images[selectedImage] || "/placeholder-wine.jpg"}
                alt={wine.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {wine.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {wine.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square relative overflow-hidden rounded-md ${
                      selectedImage === index
                        ? "ring-2 ring-red-600"
                        : "ring-1 ring-gray-200 dark:ring-gray-700"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${wine.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className={getTypeColor(wine.type)}>
                {getTypeName(wine.type)}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
                {wine.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(wine.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {wine?.rating ? wine.rating : "Chưa có đánh giá"} (
                    {wine.reviews} đánh giá)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline space-x-4">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatPrice(wine.price)}
                </span>
                {wine.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(wine.originalPrice)}
                  </span>
                )}
              </div>
              {wine.originalPrice && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Tiết kiệm {formatPrice(wine.originalPrice - wine.price)}
                </p>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {wine.description || "Không có mô tả chi tiết."}
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Nhà sản xuất:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {wine.winery || "Không có thông tin"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Quốc gia:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {wine.country}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Vùng:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {wine.region || "Không có thông tin"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Năm:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {wine.year || "Không có thông tin"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Độ cồn:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {wine.alcohol ? `${wine.alcohol}%` : "Không có thông tin"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Dung tích:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {wine.volume ? `${wine.volume}ml` : "Không có thông tin"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số lượng:
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!wine.inStock || isAddingToCart}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 mr-2" />
                  )}
                  Thêm vào giỏ hàng
                </Button>

                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>

                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {!wine.inStock && (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Sản phẩm hiện tại hết hàng
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Truck className="h-4 w-4" />
                <span>Giao hàng miễn phí cho đơn hàng từ 2.000.000₫</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="h-4 w-4" />
                <span>Đảm bảo chính hãng 100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Thông tin chi tiết
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Giống nho:
                      </span>
                      <p className="text-gray-600 dark:text-gray-400">
                        {wine.grapes.length > 0
                          ? wine.grapes.join(", ")
                          : "Không có thông tin"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Nhiệt độ phục vụ:
                      </span>
                      <p className="text-gray-600 dark:text-gray-400">
                        {wine.servingTemp || "Không có thông tin"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Kết hợp với:
                      </span>
                      <p className="text-gray-600 dark:text-gray-400">
                        {wine.pairings.length > 0
                          ? wine.pairings.join(", ")
                          : "Không có thông tin"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Mô tả chi tiết
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {wine.description || "Không có mô tả chi tiết."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {relatedWines.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedWines.map((relatedWine) => (
                <ProductCard key={relatedWine.id} wine={relatedWine} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

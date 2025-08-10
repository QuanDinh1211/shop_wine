"use client";

import React, { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accessory } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { 
  Loader2, 
  ShoppingCart, 
  Share2, 
  ArrowLeft, 
  RefreshCw,
  Truck,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { AccessoryCard } from "@/components/products/AccessoryCard";

export default function AccessoryDetailPage() {
  const params = useParams();
  const { addAccessory } = useCart();
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [relatedAccessories, setRelatedAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchAccessory() {
      if (!params.id) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/accessories/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          setAccessory(data);
          // Fetch related accessories
          const relatedResponse = await fetch(`/api/accessories?limit=4&type=${data.accessoryType}`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedAccessories(relatedData.accessories.filter((a: Accessory) => a.id !== data.id));
          }
        } else {
          if (response.status === 404) {
            notFound();
          }
          throw new Error("Không thể lấy thông tin phụ kiện");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAccessory();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!accessory) return;
    setIsAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        addAccessory(accessory);
      }
      toast.success(`Đã thêm ${quantity} ${accessory.name} vào giỏ hàng`);
    } finally {
      setIsAddingToCart(false);
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
            href="/accessories"
            className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách phụ kiện
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

  if (!accessory) {
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
            href="/accessories"
            className="hover:text-red-600 dark:hover:text-red-400"
          >
            Phụ kiện
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white truncate">
            {accessory.name}
          </span>
        </div>

        <Link
          href="/accessories"
          className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách phụ kiện
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <Image
                src={accessory.images[selectedImage] || "/placeholder-accessory.jpg"}
                alt={accessory.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {accessory.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {accessory.images.map((image, index) => (
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
                      alt={`${accessory.name} ${index + 1}`}
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
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {accessory.accessoryType}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
                {accessory.name}
              </h1>
              {accessory.brand && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  Thương hiệu: <span className="font-semibold">{accessory.brand}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline space-x-4">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatPrice(accessory.price)}
                </span>
                {accessory.originalPrice && accessory.originalPrice > accessory.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(accessory.originalPrice)}
                  </span>
                )}
              </div>
              {accessory.originalPrice && accessory.originalPrice > accessory.price && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Tiết kiệm {formatPrice(accessory.originalPrice - accessory.price)}
                </p>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {accessory.description || "Không có mô tả chi tiết."}
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Loại phụ kiện:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {accessory.accessoryType}
                </p>
              </div>
              {accessory.brand && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Thương hiệu:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {accessory.brand}
                  </p>
                </div>
              )}
              {accessory.material && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Chất liệu:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {accessory.material}
                  </p>
                </div>
              )}
              {accessory.color && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Màu sắc:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {accessory.color}
                  </p>
                </div>
              )}
              {accessory.size && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Kích thước:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {accessory.size}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tình trạng:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {accessory.inStock ? "Còn hàng" : "Hết hàng"}
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
                  disabled={!accessory.inStock || isAddingToCart}
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

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .then(() => {
                        toast.success("Đã sao chép liên kết!");
                      })
                      .catch((err) => {
                        toast.error("Lỗi sao chép:", err);
                      });
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {!accessory.inStock && (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Phụ kiện hiện tại hết hàng
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
                        Loại phụ kiện:
                      </span>
                      <p className="text-gray-600 dark:text-gray-400">
                        {accessory.accessoryType}
                      </p>
                    </div>
                    {accessory.brand && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Thương hiệu:
                        </span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {accessory.brand}
                        </p>
                      </div>
                    )}
                    {accessory.material && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Chất liệu:
                        </span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {accessory.material}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Mô tả chi tiết
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {accessory.description || "Không có mô tả chi tiết."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {relatedAccessories.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Phụ kiện liên quan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {relatedAccessories.map((relatedAccessory) => (
                <AccessoryCard key={relatedAccessory.id} accessory={relatedAccessory} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

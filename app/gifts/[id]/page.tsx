"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Gift } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  ArrowLeft,
  Share2,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import GiftCard from "@/components/products/GiftCard";

export default function GiftDetailPage() {
  const params = useParams<{ id: string }>();
  const { addGift } = useCart();
  const [gift, setGift] = useState<Gift | null>(null);
  const [relatedGifts, setRelatedGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchGift() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/gifts/${params.id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Không thể lấy thông tin quà tặng");
        }
        const data = await res.json();
        setGift(data.gift);
        setRelatedGifts(data.relatedGifts || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchGift();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!gift) return;
    setIsAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        addGift(gift);
      }
      toast.success(`Đã thêm ${quantity} ${gift.name} vào giỏ hàng`);
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

  const getGiftTypeName = (type: string) => {
    switch (type) {
      case "set":
        return "Set quà";
      case "single":
        return "1 chai";
      case "combo":
        return "Combo";
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
            href="/gifts"
            className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách quà tặng
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

  if (!gift) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-300">
        Không tìm thấy quà tặng
      </div>
    );
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
            href="/gifts"
            className="hover:text-red-600 dark:hover:text-red-400"
          >
            Quà tặng
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white truncate">
            {gift.name}
          </span>
        </div>

        <Link
          href="/gifts"
          className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách quà tặng
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <Image
                src={
                  gift.images?.[selectedImage] || "/placeholder-accessory.jpg"
                }
                alt={gift.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {gift.images && gift.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {gift.images.map((image, index) => (
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
                      alt={`${gift.name} ${index + 1}`}
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
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                >
                  {getGiftTypeName(gift.giftType)}
                </Badge>
                {gift.includeWine && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Kèm rượu
                  </Badge>
                )}
                {gift.featured && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  >
                    Nổi bật
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
                {gift.name}
              </h1>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline space-x-4">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatPrice(gift.price)}
                </span>
                {gift.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(gift.originalPrice)}
                  </span>
                )}
              </div>
              {gift.originalPrice && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Tiết kiệm {formatPrice(gift.originalPrice - gift.price)}
                </p>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {gift.description || "Không có mô tả chi tiết."}
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Loại quà:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {getGiftTypeName(gift.giftType)}
                </p>
              </div>
              {gift.theme && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Chủ đề:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {gift.theme}
                  </p>
                </div>
              )}
              {gift.packaging && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Bao bì:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {gift.packaging}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tình trạng:
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {gift.inStock ? "Còn hàng" : "Hết hàng"}
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
                  disabled={!gift.inStock || isAddingToCart}
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

              {!gift.inStock && (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Quà tặng hiện tại hết hàng
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

        {gift.items && gift.items.length > 0 && (
          <div className="mb-16">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Nội dung trong set quà
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gift.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {relatedGifts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Quà tặng liên quan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {relatedGifts.map((relatedGift) => (
                <GiftCard key={relatedGift.id} gift={relatedGift} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const shippingFee = state.total >= 2000000 ? 0 : 50000;
  const finalTotal = state.total + shippingFee;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Bạn chưa thêm sản phẩm nào vào giỏ hàng
            </p>
            <Link href="/products">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Giỏ hàng ({state.itemCount} sản phẩm)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => {
              const product = item.wine || item.accessory || item.gift;
              const productType = item.productType;

              // Skip rendering if product is undefined
              if (!product) {
                return null;
              }

              // Safely get image source
              const getImageSrc = () => {
                if (product.images && product.images.length > 0) {
                  return product.images[0];
                }
                // Fallback images for each product type
                switch (productType) {
                  case "wine":
                    return "/placeholder-wine.jpg";
                  case "accessory":
                    return "/placeholder-accessory.jpg";
                  case "gift":
                    return "/placeholder-accessory.jpg";
                  default:
                    return "/placeholder-wine.jpg";
                }
              };

              // Get product details based on type
              const getProductDetails = () => {
                switch (productType) {
                  case "wine":
                    return `${item.wine?.winery || ""} • ${
                      item.wine?.country || ""
                    } • ${item.wine?.year || ""}`;
                  case "accessory":
                    return `${item.accessory?.accessoryType || ""} • ${
                      item.accessory?.brand || ""
                    }`;
                  case "gift":
                    return `${
                      item.gift?.giftType === "set"
                        ? "Set quà"
                        : item.gift?.giftType === "single"
                        ? "1 chai"
                        : "Combo"
                    } • ${item.gift?.theme || ""}`;
                  default:
                    return "";
                }
              };

              // Get product link
              const getProductLink = () => {
                switch (productType) {
                  case "wine":
                    return `/products/${product.id}`;
                  case "accessory":
                    return `/accessories/${product.id}`;
                  case "gift":
                    return `/gifts/${product.id}`;
                  default:
                    return `/products/${product.id}`;
                }
              };

              return (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <div className="relative w-24 h-32 flex-shrink-0">
                        <Image
                          src={getImageSrc()}
                          alt={product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={getProductLink()}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {getProductDetails()}
                        </p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-2">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                product.id,
                                item.quantity - 1
                              )
                            }
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                product.id,
                                item.quantity + 1
                              )
                            }
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-between items-center pt-4">
              <Link
                href={(() => {
                  // Determine the best page to continue shopping based on cart contents
                  const hasWines = state.items.some(
                    (item) => item.productType === "wine"
                  );
                  const hasAccessories = state.items.some(
                    (item) => item.productType === "accessory"
                  );
                  const hasGifts = state.items.some(
                    (item) => item.productType === "gift"
                  );

                  if (hasWines && !hasAccessories && !hasGifts)
                    return "/products";
                  if (hasAccessories && !hasWines && !hasGifts)
                    return "/accessories";
                  if (hasGifts && !hasWines && !hasAccessories) return "/gifts";

                  // If mixed or no items, default to products
                  return "/products";
                })()}
              >
                <Button variant="outline">Tiếp tục mua sắm</Button>
              </Link>

              <Button
                variant="ghost"
                onClick={() => {
                  clearCart();
                  toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Xóa tất cả
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tạm tính ({state.itemCount} sản phẩm)
                  </span>
                  <span className="font-semibold">
                    {formatPrice(state.total)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Phí vận chuyển
                  </span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>

                {state.total < 2000000 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mua thêm {formatPrice(2000000 - state.total)} để được miễn
                    phí vận chuyển
                  </p>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-red-600 dark:text-red-400">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                <Link href="/checkout" className="block">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    Tiến hành thanh toán
                  </Button>
                </Link>

                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Giá đã bao gồm VAT
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

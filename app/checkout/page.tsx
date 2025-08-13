"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface OrderData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  notes: string;
}

export default function Checkout() {
  const {
    state: { items: cartItems, total: cartTotal },
    clearCart,
  } = useCart();
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const [orderCodeRender, setOrderCodeRender] = useState("");

  const shippingFee = cartTotal >= 2000000 ? 0 : 50000;
  const total = cartTotal + shippingFee;

  // Chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!user && !isLoading) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      router.push("/auth?redirect=/checkout");
    }
  }, [user, router, isLoading]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      router.push("/auth?redirect=/checkout");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...orderData,
            userId: user.id,
            items: cartItems,
            total,
          }),
        }
      );

      if (!res.ok) throw new Error("Lỗi khi tạo đơn hàng");
      const result = await res.json();
      setOrderCodeRender(result.orderCode || "");
      setOrderStatus("success");
      clearCart();
      toast.success("Đơn hàng đã được đặt thành công!");
    } catch (error) {
      setOrderStatus("error");
      toast.error("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Chờ chuyển hướng
  }

  if (orderStatus === "success") {
    window.scrollTo({ top: 0, behavior: "smooth" });

    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Đơn hàng đã được xác nhận!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ gửi email xác nhận sớm.
            </p>
            {orderCodeRender && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Mã đơn hàng</p>
                <p className="text-2xl font-bold text-red-900">
                  {orderCodeRender}
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="bg-red-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-red-900 mb-4">Thanh toán</h1>
          <p className="text-xl text-gray-600">
            Hoàn tất đơn hàng rượu của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
                  <Truck className="h-6 w-6 mr-3" />
                  Thông tin giao hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={orderData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={orderData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={orderData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all"
                      placeholder="Nhập email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={orderData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all"
                      placeholder="Địa chỉ giao hàng"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
                  <CreditCard className="h-6 w-6 mr-3" />
                  Phương thức thanh toán
                </h2>
                <div className="space-y-4 mb-6">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={orderData.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="text-red-900 focus:ring-red-900"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">
                        Thanh toán khi nhận hàng
                      </p>
                      <p className="text-sm text-gray-600">
                        Thanh toán khi nhận được đơn hàng
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={orderData.paymentMethod === "bank"}
                      onChange={handleChange}
                      className="text-red-900 focus:ring-red-900"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">
                        Chuyển khoản ngân hàng
                      </p>
                      <p className="text-sm text-gray-600">
                        Chuyển khoản đến tài khoản ngân hàng của chúng tôi
                      </p>
                    </div>
                  </label>
                  {/* <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={orderData.paymentMethod === "card"}
                      onChange={handleChange}
                      className="text-red-900 focus:ring-red-900"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">
                        Thẻ tín dụng/Thẻ ghi nợ
                      </p>
                      <p className="text-sm text-gray-600">
                        Thanh toán an toàn bằng thẻ
                      </p>
                    </div>
                  </label> */}
                </div>
                {orderData.paymentMethod === "card" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 bg-gray-50 rounded-lg">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Số thẻ *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={orderData.cardNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tên trên thẻ *
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={orderData.cardName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all"
                        placeholder="Tên trên thẻ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ngày hết hạn *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={orderData.expiryDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={orderData.cvv}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all"
                        placeholder="123"
                      />
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú đơn hàng (Tùy chọn)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={orderData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all resize-none"
                    placeholder="Ghi chú đặc biệt cho đơn hàng..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-red-900 mb-6">
                  Tóm tắt đơn hàng
                </h2>
                <div className="space-y-4 mb-6">
                  {cartItems.length === 0 ? (
                    <p className="text-gray-600">Giỏ hàng trống</p>
                  ) : (
                    cartItems.map((item) => {
                      const product = item.wine || item.accessory || item.gift;
                      const productType = item.productType;

                      if (!product) return null;

                      return (
                        <div
                          key={product.id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg w-16 h-16 flex items-center justify-center">
                            <div className="relative w-16 h-20 flex-shrink-0">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {productType === "wine" && item.wine && (
                                <>
                                  {item.wine.winery} • {item.wine.country} •{" "}
                                  {item.wine.year}
                                </>
                              )}
                              {productType === "accessory" &&
                                item.accessory && (
                                  <>
                                    {item.accessory.accessoryType} •{" "}
                                    {item.accessory.brand}
                                  </>
                                )}

                              {productType === "gift" && item.gift && (
                                <>
                                  {`${
                                    item.gift?.giftType === "set"
                                      ? "Set quà"
                                      : item.gift?.giftType === "single"
                                      ? "1 chai"
                                      : "Combo"
                                  } • ${item.gift?.theme || ""}`}
                                </>
                              )}
                            </p>
                            <p className="text-gray-600 text-sm">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {(product.price * item.quantity).toLocaleString(
                                "vi-VN"
                              )}
                              ₫
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="border-t pt-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{cartTotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>
                      {shippingFee === 0
                        ? "Miễn phí"
                        : formatPrice(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-red-900 pt-3 border-t">
                    <span>Tổng cộng</span>
                    <span>{total.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className={`w-full mt-8 bg-red-900 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    isSubmitting || cartItems.length === 0
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:bg-red-800 transform hover:scale-105"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      <span>Đặt hàng</span>
                    </>
                  )}
                </button>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Thanh toán an toàn với mã hóa SSL
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

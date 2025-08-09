"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Calendar,
  CreditCard,
  Eye,
  ChevronRight,
  Wine,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

interface OrderItem {
  wine_id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  winery: string;
  country: string;
  year: string;
}

interface Order {
  order_id: string;
  order_code: string;
  order_date: string;
  items: OrderItem[];
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: "cod" | "bank" | "card";
  shipping_address: string;
  full_name: string;
  email: string;
  phone: string;
  notes?: string;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token, isLoading: loadUser } = useAuth();
  const router = useRouter();

  // Lấy dữ liệu đơn hàng từ API
  useEffect(() => {
    if (!loadUser) {
      if (!user || !token) {
        toast.error("Vui lòng đăng nhập để xem lịch sử đơn hàng");
        router.push("/auth?redirect=/history");
        return;
      }

      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!res.ok) {
            throw new Error("Không thể lấy dữ liệu đơn hàng");
          }
          const data = await res.json();
          setOrders(data);
        } catch (error: any) {
          toast.error(`Lỗi khi tải lịch sử đơn hàng: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrders();
    }
  }, [user, token, router, loadUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã huỷ";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng";
      case "bank":
        return "Chuyển khoản ngân hàng";
      case "card":
        return "Thẻ tín dụng/Thẻ ghi nợ";
      default:
        return method;
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-red-900 mb-4">
            Lịch sử đơn hàng
          </h1>
          <p className="text-xl text-gray-600">
            Theo dõi tất cả đơn hàng rượu vang của bạn
          </p>
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 p-4 rounded-full">
              <Wine className="h-8 w-8 text-red-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chào mừng trở lại, {user?.name || "Khách hàng"}!
              </h2>
              <p className="text-gray-600">{user?.email || "Khách hàng VIP"}</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-red-900" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.order_code}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(order.order_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <span
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </span>
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Xem chi tiết</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        Sản phẩm
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">
                      {order.items.length} loại
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      chai
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        Tổng tiền
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">
                      {order.total_amount.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-sm text-gray-600">
                      {getPaymentMethodText(order.payment_method)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        Giao hàng
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-8">
              Bạn chưa đặt đơn hàng nào. Hãy khám phá bộ sưu tập rượu vang tuyệt
              vời của chúng tôi!
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-red-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
            >
              Mua sắm ngay
            </button>
          </div>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-red-900">
                      Chi tiết đơn hàng
                    </h2>
                    <p className="text-gray-600">{selectedOrder.order_code}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Thông tin đơn hàng
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã đơn hàng:</span>
                        <span className="font-semibold">
                          {selectedOrder.order_code}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày đặt:</span>
                        <span className="font-semibold">
                          {new Date(
                            selectedOrder.order_date
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {getStatusIcon(selectedOrder.status)}
                          <span>{getStatusText(selectedOrder.status)}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thanh toán:</span>
                        <span className="font-semibold">
                          {getPaymentMethodText(selectedOrder.payment_method)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tên khách hàng:</span>
                        <span className="font-semibold">
                          {selectedOrder.full_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-semibold">
                          {selectedOrder.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số điện thoại:</span>
                        <span className="font-semibold">
                          {selectedOrder.phone}
                        </span>
                      </div>
                      {selectedOrder.notes && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ghi chú:</span>
                          <span className="font-semibold">
                            {selectedOrder.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Địa chỉ giao hàng
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Sản phẩm đã đặt
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.wine_id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg w-16 h-16 flex items-center justify-center">
                          {/* <Wine className="h-8 w-8 text-red-900" /> */}
                          <div className="relative w-16 h-20 flex-shrink-0">
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.winery} • {item.country} • {item.year}
                          </p>
                          <p className="text-gray-600">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {item.price.toLocaleString("vi-VN")}₫
                          </p>
                          <p className="text-sm text-gray-600">
                            Tổng:{" "}
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span className="text-2xl font-bold text-red-900">
                      {selectedOrder.total_amount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                  {selectedOrder.status === "delivered" && (
                    <button
                      onClick={() => router.push("/products")} // Chuyển hướng đến trang sản phẩm
                      className="px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors"
                    >
                      Mua lại
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

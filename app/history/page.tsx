"use client";
import { useState } from "react";
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

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipping" | "delivered" | "cancelled";
  paymentMethod: string;
  shippingAddress: string;
}

export default function OrderHistory() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock order data
  const orders: Order[] = [
    {
      id: "1",
      orderNumber: "VWO-2024001",
      date: "2024-01-15",
      items: [
        {
          id: 1,
          name: "Cabernet Sauvignon Reserve 2019",
          price: 1200000,
          quantity: 2,
          image: "wine-red",
        },
        {
          id: 2,
          name: "Chardonnay Premium 2020",
          price: 850000,
          quantity: 1,
          image: "wine-white",
        },
      ],
      totalAmount: 3250000,
      status: "delivered",
      paymentMethod: "Credit Card",
      shippingAddress: "123 Nguyen Hue, District 1, Ho Chi Minh City",
    },
    {
      id: "2",
      orderNumber: "VWO-2024002",
      date: "2024-01-20",
      items: [
        {
          id: 3,
          name: "Pinot Noir Vintage 2018",
          price: 950000,
          quantity: 3,
          image: "wine-red",
        },
      ],
      totalAmount: 2850000,
      status: "shipping",
      paymentMethod: "Bank Transfer",
      shippingAddress: "456 Le Loi, District 3, Ho Chi Minh City",
    },
    {
      id: "3",
      orderNumber: "VWO-2024003",
      date: "2024-01-25",
      items: [
        {
          id: 4,
          name: "Merlot Classic 2021",
          price: 680000,
          quantity: 1,
          image: "wine-red",
        },
        {
          id: 5,
          name: "Sauvignon Blanc 2022",
          price: 720000,
          quantity: 2,
          image: "wine-white",
        },
      ],
      totalAmount: 2120000,
      status: "processing",
      paymentMethod: "Cash on Delivery",
      shippingAddress: "789 Dong Khoi, District 1, Ho Chi Minh City",
    },
    {
      id: "4",
      orderNumber: "VWO-2024004",
      date: "2024-02-01",
      items: [
        {
          id: 6,
          name: "Rosé Premium 2021",
          price: 780000,
          quantity: 4,
          image: "wine-rose",
        },
      ],
      totalAmount: 3120000,
      status: "pending",
      paymentMethod: "Credit Card",
      shippingAddress: "321 Hai Ba Trung, District 1, Ho Chi Minh City",
    },
    {
      id: "5",
      orderNumber: "VWO-2024005",
      date: "2024-02-05",
      items: [
        {
          id: 7,
          name: "Champagne Deluxe 2019",
          price: 2500000,
          quantity: 1,
          image: "wine-champagne",
        },
      ],
      totalAmount: 2500000,
      status: "cancelled",
      paymentMethod: "Bank Transfer",
      shippingAddress: "654 Pasteur, District 3, Ho Chi Minh City",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipping":
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
      case "shipping":
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
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã huỷ";
      default:
        return status;
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
                Chào mừng trở lại!
              </h2>
              <p className="text-gray-600">Nguyễn Văn An • Khách hàng VIP</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
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
                        {order.orderNumber}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(order.date).toLocaleDateString("vi-VN")}
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
                      {order.totalAmount.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.paymentMethod}
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
                      {order.shippingAddress.split(",")[0]}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.split(",").slice(1).join(",")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no orders) */}
        {orders.length === 0 && (
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
            <button className="bg-red-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors">
              Mua sắm ngay
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-red-900">
                    Chi tiết đơn hàng
                  </h2>
                  <p className="text-gray-600">{selectedOrder.orderNumber}</p>
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
                        {selectedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày đặt:</span>
                      <span className="font-semibold">
                        {new Date(selectedOrder.date).toLocaleDateString(
                          "vi-VN"
                        )}
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
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Địa chỉ giao hàng
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedOrder.shippingAddress}
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
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg w-16 h-16 flex items-center justify-center">
                        <Wine className="h-8 w-8 text-red-900" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.name}
                        </h4>
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
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
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
                    {selectedOrder.totalAmount.toLocaleString("vi-VN")}₫
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
                  <button className="px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors">
                    Mua lại
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

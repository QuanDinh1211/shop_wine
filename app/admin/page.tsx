"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wine,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";
import { Order, DashboardStats } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

// Dữ liệu doanh thu mẫu
const revenueData = [
  { month: "Th1", revenue: 12000 },
  { month: "Th2", revenue: 15000 },
  { month: "Th3", revenue: 18000 },
  { month: "Th4", revenue: 14000 },
  { month: "Th5", revenue: 22000 },
  { month: "Th6", revenue: 25000 },
];

export default function TrangQuanTri() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Lấy dữ liệu dashboard khi component được mount
  useEffect(() => {
    const layDuLieu = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          toast.error("Không thể tải dữ liệu bảng điều khiển");
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bảng điều khiển:", error);
        toast.error("Lỗi kết nối. Vui lòng đăng nhập lại.");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    layDuLieu();
  }, [router]);

  // Ánh xạ màu sắc cho trạng thái đơn hàng
  const layMauTrangThai = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout title="Bảng Điều Khiển">
      <div className="space-y-6">
        {/* Thẻ thống kê */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Wine className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Tổng Số Rượu
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.totalWines || 0}
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12% so với tháng trước
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Tổng Số Khách Hàng
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.totalCustomers || 0}
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8% so với tháng trước
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingCart className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Tổng Số Đơn Hàng
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.totalOrders || 0}
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +15% so với tháng trước
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Tổng Doanh Thu
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(stats?.totalRevenue || 0)}
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +22% so với tháng trước
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Biểu đồ Doanh Thu và Đơn Hàng Gần Đây */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Biểu đồ Doanh Thu */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng Quan Doanh Thu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Doanh Thu",
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Đơn Hàng Gần Đây */}
          <Card>
            <CardHeader>
              <CardTitle>Đơn Hàng Gần Đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Đơn Hàng #{order.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.shippingAddress?.name || "Không xác định"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </p>
                        <Badge className={layMauTrangThai(order.status)}>
                          {order.status === "pending"
                            ? "Đang chờ"
                            : order.status === "processing"
                            ? "Đang xử lý"
                            : order.status === "shipped"
                            ? "Đã giao"
                            : order.status === "delivered"
                            ? "Hoàn tất"
                            : "Đã hủy"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Không có đơn hàng gần đây
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

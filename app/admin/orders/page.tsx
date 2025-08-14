"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Eye, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Order } from "@/lib/admin/types";
import { toast } from "sonner";
import { DialogClose } from "@radix-ui/react-dialog";

export default function TrangQuanLyDonHang() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState({
    orderCode: "",
    customerName: "",
    status: "",
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Lấy danh sách đơn hàng khi component được mount hoặc page/searchParams thay đổi
  useEffect(() => {
    layDanhSachDonHang();
  }, [page, searchParams]);

  const layDanhSachDonHang = async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchParams.orderCode && { orderCode: searchParams.orderCode }),
        ...(searchParams.customerName && {
          customerName: searchParams.customerName,
        }),
        ...(searchParams.status && { status: searchParams.status }),
      }).toString();

      const response = await fetch(`/api/admin/orders?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cập nhật trạng thái đơn hàng
  const xuLyCapNhatTrangThai = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        await layDanhSachDonHang();
        setSelectedOrder(null);
        setIsDetailsOpen(false);
        toast.success("Đã cập nhật trạng thái đơn hàng thành công");
      } else {
        toast.error("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Xử lý thay đổi tham số tìm kiếm
  const handleSearchChange = (key: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset về trang 1 khi thay đổi tìm kiếm
  };

  // Lấy trạng thái đơn hàng
  const layTrangThaiDonHang = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "Đang chờ", color: "bg-yellow-100 text-yellow-800" };
      case "processing":
        return { text: "Đang xử lý", color: "bg-blue-100 text-blue-800" };
      case "shipped":
        return { text: "Đã giao", color: "bg-purple-100 text-purple-800" };
      case "delivered":
        return { text: "Hoàn tất", color: "bg-green-100 text-green-800" };
      case "cancelled":
        return { text: "Đã hủy", color: "bg-red-100 text-red-800" };
      default:
        return { text: "Không xác định", color: "bg-gray-100 text-gray-800" };
    }
  };

  // Lấy tên phương thức thanh toán
  const layPhuongThucThanhToan = (method: string) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng";
      case "bank":
        return "Chuyển khoản ngân hàng";
      case "card":
        return "Thẻ tín dụng";
      default:
        return "Không xác định";
    }
  };

  return (
    <AdminLayout title="Quản Lý Đơn Hàng">
      <div className="space-y-6">
        {/* Form tìm kiếm */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm mã đơn hàng..."
              value={searchParams.orderCode}
              onChange={(e) => handleSearchChange("orderCode", e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchParams.customerName}
              onChange={(e) =>
                handleSearchChange("customerName", e.target.value)
              }
              className="pl-10"
            />
          </div>
          <Select
            value={searchParams.status}
            onValueChange={(value) => handleSearchChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="shipped">Đã giao</SelectItem>
              <SelectItem value="delivered">Hoàn tất</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bảng danh sách đơn hàng */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã Đơn Hàng</TableHead>
                <TableHead>Khách Hàng</TableHead>
                <TableHead>Tổng Tiền</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Đặt</TableHead>
                <TableHead>Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const status = layTrangThaiDonHang(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderCode || order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.shippingAddress.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.shippingAddress.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{order.total.toLocaleString()} VNĐ</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog
                            open={
                              isDetailsOpen && selectedOrder?.id === order.id
                            }
                            onOpenChange={(open) => {
                              setIsDetailsOpen(open);
                              if (!open) setSelectedOrder(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent
                              hideClose
                              className="p-0 border-none max-w-5xl w-full max-h-[95vh] overflow-y-auto bg-transparent"
                            >
                              <div className="bg-white rounded-2xl shadow-2xl w-full p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                  <div>
                                    <h2 className="text-3xl font-bold text-red-900">
                                      Chi tiết đơn hàng
                                    </h2>
                                    <p className="text-gray-600">
                                      #{order.orderCode || order.id}
                                    </p>
                                  </div>
                                  <DialogClose asChild>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                      <XCircle className="h-6 w-6 text-gray-600" />
                                    </button>
                                  </DialogClose>
                                </div>

                                {/* Grid Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                  {/* Thông tin đơn hàng */}
                                  <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                      Thông tin đơn hàng
                                    </h3>
                                    <InfoLine
                                      label="Mã đơn hàng"
                                      value={order.orderCode || order.id}
                                    />
                                    <InfoLine
                                      label="Ngày đặt"
                                      value={new Date(
                                        order.createdAt
                                      ).toLocaleString("vi-VN")}
                                    />
                                    <InfoLine
                                      label="Phương thức"
                                      value={layPhuongThucThanhToan(
                                        order.paymentMethod
                                      )}
                                    />
                                    <InfoLine
                                      label="Ghi chú"
                                      value={order.notes}
                                      hidden={!order.notes}
                                    />
                                  </div>

                                  {/* Thông tin giao hàng */}
                                  <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                      Thông tin giao hàng
                                    </h3>
                                    <InfoLine
                                      label="Tên"
                                      value={order.shippingAddress.name}
                                    />
                                    <InfoLine
                                      label="Email"
                                      value={order.shippingAddress.email}
                                    />
                                    <InfoLine
                                      label="Điện thoại"
                                      value={order.shippingAddress.phone}
                                    />
                                    <InfoLine
                                      label="Địa chỉ"
                                      value={order.shippingAddress.address}
                                    />
                                  </div>
                                </div>

                                {/* Danh sách sản phẩm */}
                                <div className="mb-8">
                                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Sản phẩm đã đặt
                                  </h3>
                                  <div className="space-y-4">
                                    {order.items.map((item, index) => {
                                      let name = "";
                                      let subInfo = "";
                                      let images: string[] = [];

                                      if (
                                        item.productType === "wine" &&
                                        item.wine
                                      ) {
                                        name = item.wine.name;
                                        subInfo = `${item.wine.winery} • ${item.wine.country} • ${item.wine.year}`;
                                        images = item.wine.images;
                                      } else if (
                                        item.productType === "gift" &&
                                        item.gift
                                      ) {
                                        name = item.gift.name;
                                        subInfo = `${
                                          item.gift.giftType === "set"
                                            ? "Set quà"
                                            : item.gift.giftType === "single"
                                            ? "1 chai"
                                            : "Combo"
                                        } • ${item.gift.theme || ""}`;
                                        images = item.gift.images;
                                      } else if (
                                        item.productType === "accessory" &&
                                        item.accessory
                                      ) {
                                        name = item.accessory.name;
                                        subInfo = `${
                                          item.accessory.accessoryType
                                        } • ${item.accessory.brand || ""}`;
                                        images = item.accessory.images;
                                      }

                                      return (
                                        <div
                                          key={index}
                                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                                        >
                                          <div className="relative w-16 h-20 rounded overflow-hidden bg-gray-100">
                                            <Image
                                              src={
                                                images[0] || "/placeholder.jpg"
                                              }
                                              alt={name}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">
                                              {name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                              {subInfo}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Số lượng: {item.quantity}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                              {item.unitPrice.toLocaleString(
                                                "vi-VN"
                                              )}
                                              ₫
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Tổng:{" "}
                                              {(
                                                item.unitPrice * item.quantity
                                              ).toLocaleString("vi-VN")}
                                              ₫
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Tổng tiền */}
                                <div className="bg-red-50 rounded-lg p-6 flex justify-between items-center">
                                  <span className="text-xl font-bold text-gray-900">
                                    Tổng cộng:
                                  </span>
                                  <span className="text-2xl font-bold text-red-900">
                                    {order.total.toLocaleString("vi-VN")}₫
                                  </span>
                                </div>

                                {/* Trạng thái đơn hàng */}
                                <div className="mt-8">
                                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                                    Cập nhật trạng thái đơn hàng
                                  </h3>
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      xuLyCapNhatTrangThai(
                                        order.id,
                                        e.target.value
                                      )
                                    }
                                    className="border p-3 rounded-lg w-full max-w-sm"
                                  >
                                    <option value="pending">Đang chờ</option>
                                    <option value="processing">
                                      Đang xử lý
                                    </option>
                                    <option value="shipped">Đã giao</option>
                                    <option value="delivered">Hoàn tất</option>
                                    <option value="cancelled">Đã hủy</option>
                                  </select>
                                </div>

                                {/* Hành động */}
                                <div className="flex justify-end space-x-4 mt-8">
                                  <DialogClose asChild>
                                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                                      Đóng
                                    </button>
                                  </DialogClose>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy đơn hàng
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)}{" "}
            trong tổng số {total} đơn hàng
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Trang {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function InfoLine({
  label,
  value,
  hidden = false,
}: {
  label: string;
  value: React.ReactNode;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <div className="flex justify-between text-sm text-gray-700">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

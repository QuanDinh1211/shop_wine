"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Eye } from "lucide-react";
import { User, Order } from "@/lib/admin/types";
import { toast } from "sonner";

export default function TrangQuanLyKhachHang() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Lấy danh sách khách hàng khi component được mount
  useEffect(() => {
    layDanhSachKhachHang();
  }, []);

  const layDanhSachKhachHang = async () => {
    try {
      const response = await fetch("/api/admin/customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        toast.error("Không thể tải danh sách khách hàng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Lọc khách hàng dựa trên từ khóa tìm kiếm
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Lấy vai trò khách hàng
  const layVaiTro = (isAdmin: boolean) => {
    return isAdmin ? (
      <Badge className="bg-red-100 text-red-800">Quản trị viên</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">Khách hàng</Badge>
    );
  };

  return (
    <AdminLayout title="Quản Lý Khách Hàng">
      <div className="space-y-6">
        {/* Hành động tiêu đề */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Bảng danh sách khách hàng */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
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
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || "N/A"}</TableCell>
                    <TableCell>{layVaiTro(customer.isAdmin)}</TableCell>
                    <TableCell>
                      <Dialog
                        open={
                          isDetailsOpen && selectedCustomer?.id === customer.id
                        }
                        onOpenChange={(open) => {
                          setIsDetailsOpen(open);
                          if (!open) setSelectedCustomer(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>👤 Chi Tiết Khách Hàng</DialogTitle>
                            <DialogDescription>
                              Thông tin cá nhân và các đơn hàng đã đặt
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-6 mt-4">
                            {/* Thông tin khách hàng */}
                            <section className="space-y-2 border p-4 rounded-md">
                              <h3 className="text-base font-semibold">
                                Thông tin khách hàng
                              </h3>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p>
                                  <strong>ID:</strong> {customer.id}
                                </p>
                                <p>
                                  <strong>Tên:</strong> {customer.name}
                                </p>
                                <p>
                                  <strong>Email:</strong> {customer.email}
                                </p>
                                <p>
                                  <strong>Điện thoại:</strong>{" "}
                                  {customer.phone || "N/A"}
                                </p>
                                <p>
                                  <strong>Địa chỉ:</strong>{" "}
                                  {customer.address || "N/A"}
                                </p>
                                <p>
                                  <strong>Vai trò:</strong>{" "}
                                  {customer.isAdmin
                                    ? "Quản trị viên"
                                    : "Khách hàng"}
                                </p>
                              </div>
                            </section>

                            {/* Đơn hàng gần đây */}
                            {selectedCustomer?.orders &&
                              selectedCustomer?.orders?.length > 0 && (
                                <section className="space-y-2 border p-4 rounded-md">
                                  <h3 className="text-base font-semibold">
                                    Đơn hàng gần đây
                                  </h3>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Mã</TableHead>
                                        <TableHead>Tổng tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày đặt</TableHead>
                                        <TableHead>Sản phẩm</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedCustomer.orders.map((order) => {
                                        const status = layTrangThaiDonHang(
                                          order.status
                                        );
                                        return (
                                          <TableRow key={order.id}>
                                            <TableCell>
                                              {order.orderCode}
                                            </TableCell>
                                            <TableCell>
                                              {order.total.toLocaleString()} VNĐ
                                            </TableCell>
                                            <TableCell>
                                              <Badge className={status.color}>
                                                {status.text}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              {new Date(
                                                order.createdAt
                                              ).toLocaleString("vi-VN")}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex flex-col gap-1">
                                                {order.items.map(
                                                  (item, index) => {
                                                    let name = "";
                                                    let images: string[] = [];

                                                    if (
                                                      item.productType ===
                                                        "wine" &&
                                                      item.wine
                                                    ) {
                                                      name = item.wine.name;
                                                      images = item.wine.images;
                                                    } else if (
                                                      item.productType ===
                                                        "gift" &&
                                                      item.gift
                                                    ) {
                                                      name = item.gift.name;
                                                      images = item.gift.images;
                                                    } else if (
                                                      item.productType ===
                                                        "accessory" &&
                                                      item.accessory
                                                    ) {
                                                      name =
                                                        item.accessory.name;
                                                      images =
                                                        item.accessory.images;
                                                    }

                                                    return (
                                                      <div
                                                        key={index}
                                                        className="flex items-center space-x-2"
                                                      >
                                                        <div className="relative h-8 w-8 rounded overflow-hidden">
                                                          <Image
                                                            src={
                                                              images[0] ||
                                                              "/placeholder-wine.jpg"
                                                            }
                                                            alt={name}
                                                            fill
                                                            className="object-cover"
                                                          />
                                                        </div>
                                                        <span>
                                                          {name} (x
                                                          {item.quantity})
                                                        </span>
                                                      </div>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </section>
                              )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy khách hàng
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}

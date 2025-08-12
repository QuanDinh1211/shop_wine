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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Accessory } from "@/lib/types";
import AccessoryForm from "@/components/admin/AccessoryForm";
import { toast } from "sonner";

export default function TrangQuanLyPhuKien() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState({
    name: "",
    type: "",
    brand: "",
    color: "",
    priceMin: "",
    priceMax: "",
    inStock: "",
  });
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Lấy danh sách phụ kiện khi component được mount hoặc page/searchParams thay đổi
  useEffect(() => {
    layDanhSachPhuKien();
  }, [page, searchParams]);

  const layDanhSachPhuKien = async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchParams.name && { name: searchParams.name }),
        ...(searchParams.type && { type: searchParams.type }),
        ...(searchParams.brand && { brand: searchParams.brand }),
        ...(searchParams.color && { color: searchParams.color }),
        ...(searchParams.priceMin && { priceMin: searchParams.priceMin }),
        ...(searchParams.priceMax && { priceMax: searchParams.priceMax }),
        ...(searchParams.inStock && { inStock: searchParams.inStock }),
      }).toString();

      const response = await fetch(`/api/admin/accessories?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAccessories(data.accessories);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error("Không thể tải danh sách phụ kiện");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phụ kiện:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa phụ kiện
  const xuLyXoa = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phụ kiện này không?")) return;

    try {
      const response = await fetch(`/api/admin/accessories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });

      if (response.ok) {
        setAccessories(accessories.filter((accessory) => accessory.id !== id));
        toast.success("Đã xóa phụ kiện thành công");
      } else {
        toast.error("Không thể xóa phụ kiện");
      }
    } catch (error) {
      console.error("Lỗi khi xóa phụ kiện:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Lấy trạng thái tồn kho
  const layTrangThaiTonKho = (inStock: boolean) => {
    if (!inStock) return { text: "Hết hàng", color: "bg-red-100 text-red-800" };
    return { text: "Còn hàng", color: "bg-green-100 text-green-800" };
  };

  // Xử lý thay đổi tham số tìm kiếm
  const handleSearchChange = (key: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset về trang 1 khi thay đổi tìm kiếm
  };

  return (
    <AdminLayout title="Quản Lý Phụ Kiện">
      <div className="space-y-6">
        {/* Form tìm kiếm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchParams.name}
              onChange={(e) => handleSearchChange("name", e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo loại..."
              value={searchParams.type}
              onChange={(e) => handleSearchChange("type", e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo thương hiệu..."
              value={searchParams.brand}
              onChange={(e) => handleSearchChange("brand", e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo màu sắc..."
              value={searchParams.color}
              onChange={(e) => handleSearchChange("color", e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Giá tối thiểu"
              value={searchParams.priceMin}
              onChange={(e) => handleSearchChange("priceMin", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Giá tối đa"
              value={searchParams.priceMax}
              onChange={(e) => handleSearchChange("priceMax", e.target.value)}
            />
          </div>
          <Select
            value={searchParams.inStock}
            onValueChange={(value) => handleSearchChange("inStock", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Còn hàng</SelectItem>
              <SelectItem value="false">Hết hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hành động tiêu đề */}
        <div className="flex justify-end">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedAccessory(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Phụ Kiện
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedAccessory
                    ? "Sửa Thông Tin Phụ Kiện"
                    : "Thêm Phụ Kiện Mới"}
                </DialogTitle>
                <DialogDescription>
                  {selectedAccessory
                    ? "Cập nhật thông tin phụ kiện"
                    : "Thêm một phụ kiện mới vào kho"}
                </DialogDescription>
              </DialogHeader>
              <AccessoryForm
                accessory={selectedAccessory}
                onSuccess={() => {
                  setIsFormOpen(false);
                  layDanhSachPhuKien();
                  setSelectedAccessory(null);
                  toast.success(
                    selectedAccessory
                      ? "Đã cập nhật phụ kiện thành công"
                      : "Đã thêm phụ kiện thành công"
                  );
                }}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedAccessory(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Bảng danh sách phụ kiện */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình Ảnh</TableHead>
                <TableHead>Tên Phụ Kiện</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Thương Hiệu</TableHead>
                <TableHead>Màu Sắc</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-16 w-16 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
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
              ) : accessories.length > 0 ? (
                accessories.map((accessory) => {
                  const stockStatus = layTrangThaiTonKho(accessory.inStock);
                  return (
                    <TableRow key={accessory.id}>
                      <TableCell>
                        <div className="h-16 w-16 relative rounded overflow-hidden">
                          <Image
                            src={
                              accessory.images[0] ||
                              "/placeholder-accessory.jpg"
                            }
                            alt={accessory.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {accessory.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {accessory.description || "Không có mô tả"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{accessory.accessoryType}</TableCell>
                      <TableCell>{accessory.brand || "N/A"}</TableCell>
                      <TableCell>{accessory.color || "N/A"}</TableCell>
                      <TableCell>
                        {accessory.price.toLocaleString()} VNĐ
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {stockStatus.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAccessory(accessory);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => xuLyXoa(accessory.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy phụ kiện
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
            trong tổng số {total} sản phẩm
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

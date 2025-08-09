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
import { Wine } from "@/lib/admin/types";
import WineForm from "@/components/admin/WineForm";
import { toast } from "sonner";

export default function TrangQuanLyRuou() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState({
    name: "",
    type: "",
    country: "",
    year: "",
    priceMin: "",
    priceMax: "",
    inStock: "",
  });
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Lấy danh sách rượu khi component được mount hoặc page/searchParams thay đổi
  useEffect(() => {
    layDanhSachRuou();
  }, [page, searchParams]);

  const layDanhSachRuou = async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchParams.name && { name: searchParams.name }),
        ...(searchParams.type && { type: searchParams.type }),
        ...(searchParams.country && { country: searchParams.country }),
        ...(searchParams.year && { year: searchParams.year }),
        ...(searchParams.priceMin && { priceMin: searchParams.priceMin }),
        ...(searchParams.priceMax && { priceMax: searchParams.priceMax }),
        ...(searchParams.inStock && { inStock: searchParams.inStock }),
      }).toString();

      const response = await fetch(`/api/admin/wines?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWines(data.wines);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error("Không thể tải danh sách rượu");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách rượu:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa rượu
  const xuLyXoa = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa loại rượu này không?")) return;

    try {
      const response = await fetch(`/api/admin/wines/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });

      if (response.ok) {
        setWines(wines.filter((wine) => wine.id !== id));
        toast.success("Đã xóa rượu thành công");
      } else {
        toast.error("Không thể xóa rượu");
      }
    } catch (error) {
      console.error("Lỗi khi xóa rượu:", error);
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
    <AdminLayout title="Quản Lý Rượu">
      <div className="space-y-6">
        {/* Form tìm kiếm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              placeholder="Tìm kiếm theo quốc gia..."
              value={searchParams.country}
              onChange={(e) => handleSearchChange("country", e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            type="number"
            placeholder="Niên vụ (VD: 2020)"
            value={searchParams.year}
            onChange={(e) => handleSearchChange("year", e.target.value)}
          />
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
                  setSelectedWine(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Rượu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedWine ? "Sửa Thông Tin Rượu" : "Thêm Rượu Mới"}
                </DialogTitle>
                <DialogDescription>
                  {selectedWine
                    ? "Cập nhật thông tin rượu"
                    : "Thêm một loại rượu mới vào kho"}
                </DialogDescription>
              </DialogHeader>
              <WineForm
                wine={selectedWine}
                onSuccess={() => {
                  setIsFormOpen(false);
                  layDanhSachRuou();
                  setSelectedWine(null);
                  toast.success(
                    selectedWine
                      ? "Đã cập nhật rượu thành công"
                      : "Đã thêm rượu thành công"
                  );
                }}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedWine(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Bảng danh sách rượu */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình Ảnh</TableHead>
                <TableHead>Tên Rượu</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Quốc Gia</TableHead>
                <TableHead>Niên Vụ</TableHead>
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
              ) : wines.length > 0 ? (
                wines.map((wine) => {
                  const stockStatus = layTrangThaiTonKho(wine.inStock);
                  return (
                    <TableRow key={wine.id}>
                      <TableCell>
                        <div className="h-16 w-16 relative rounded overflow-hidden">
                          <Image
                            src={wine.images[0] || "/placeholder-wine.jpg"}
                            alt={wine.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {wine.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {wine.description || "Không có mô tả"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{wine.type}</TableCell>
                      <TableCell>{wine.country}</TableCell>
                      <TableCell>{wine.year || "N/A"}</TableCell>
                      <TableCell>{wine.price.toLocaleString()} VNĐ</TableCell>
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
                              setSelectedWine(wine);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => xuLyXoa(wine.id)}
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
                    Không tìm thấy rượu
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

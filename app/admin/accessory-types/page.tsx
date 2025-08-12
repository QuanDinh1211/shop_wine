"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

interface AccessoryType {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TrangQuanLyLoaiPhuKien() {
  const [accessoryTypes, setAccessoryTypes] = useState<AccessoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState({
    name: "",
  });
  const [selectedType, setSelectedType] = useState<AccessoryType | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh sách loại phụ kiện khi component được mount hoặc page/searchParams thay đổi
  useEffect(() => {
    layDanhSachLoaiPhuKien();
  }, [page, searchParams]);

  const layDanhSachLoaiPhuKien = async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchParams.name && { name: searchParams.name }),
      }).toString();

      const response = await fetch(`/api/admin/accessory-types?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAccessoryTypes(data);
        setTotal(data.length);
        setTotalPages(Math.ceil(data.length / limit));
      } else {
        toast.error("Không thể tải danh sách loại phụ kiện");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại phụ kiện:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa loại phụ kiện
  const xuLyXoa = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa loại phụ kiện này không?")) return;

    try {
      const response = await fetch(`/api/admin/accessory-types/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });

      if (response.ok) {
        setAccessoryTypes(accessoryTypes.filter((type) => type.id !== id));
        toast.success("Đã xóa loại phụ kiện thành công");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Không thể xóa loại phụ kiện");
      }
    } catch (error) {
      console.error("Lỗi khi xóa loại phụ kiện:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Xử lý thay đổi tham số tìm kiếm
  const handleSearchChange = (key: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset về trang 1 khi thay đổi tìm kiếm
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = selectedType
        ? `/api/admin/accessory-types/${selectedType.id}`
        : "/api/admin/accessory-types";

      const method = selectedType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          selectedType
            ? "Đã cập nhật loại phụ kiện thành công"
            : "Đã thêm loại phụ kiện thành công"
        );
        setIsFormOpen(false);
        setSelectedType(null);
        setFormData({ name: "", description: "" });
        layDanhSachLoaiPhuKien();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi lưu loại phụ kiện:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý mở form chỉnh sửa
  const handleEdit = (type: AccessoryType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
    });
    setIsFormOpen(true);
  };

  // Xử lý mở form thêm mới
  const handleAdd = () => {
    setSelectedType(null);
    setFormData({ name: "", description: "" });
    setIsFormOpen(true);
  };

  // Xử lý đóng form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedType(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <AdminLayout title="Quản Lý Loại Phụ Kiện">
      <div className="space-y-6">
        {/* Form tìm kiếm */}
        <div className="flex space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchParams.name}
              onChange={(e) => handleSearchChange("name", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Hành động tiêu đề */}
        <div className="flex justify-end">
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Loại Phụ Kiện
          </Button>
        </div>

        {/* Bảng danh sách loại phụ kiện */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên Loại</TableHead>
                <TableHead>Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : accessoryTypes.length > 0 ? (
                accessoryTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <Badge variant="secondary">{type.id}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{type.name}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => xuLyXoa(type.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy loại phụ kiện
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Hiển thị {(page - 1) * limit + 1} -{" "}
              {Math.min(page * limit, total)} trong tổng số {total} loại phụ
              kiện
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
        )}
      </div>

      {/* Dialog form thêm/sửa */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedType ? "Sửa Loại Phụ Kiện" : "Thêm Loại Phụ Kiện Mới"}
            </DialogTitle>
            <DialogDescription>
              {selectedType
                ? "Cập nhật thông tin loại phụ kiện"
                : "Thêm một loại phụ kiện mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Tên loại phụ kiện *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nhập tên loại phụ kiện"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Đang lưu..."
                  : selectedType
                  ? "Cập nhật"
                  : "Thêm mới"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

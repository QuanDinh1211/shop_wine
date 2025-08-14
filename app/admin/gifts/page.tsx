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
import { Gift } from "@/lib/admin/types";
import GiftForm from "@/components/admin/GiftForm";
import { toast } from "sonner";

export default function TrangQuanLyQuaTang() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState({
    name: "",
    giftType: "",
    theme: "",
    includeWine: "",
    priceMin: "",
    priceMax: "",
    inStock: "",
  });
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Lấy danh sách quà tặng khi component được mount hoặc page/searchParams thay đổi
  useEffect(() => {
    layDanhSachQuaTang();
  }, [page, searchParams]);

  const layDanhSachQuaTang = async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchParams.name && { name: searchParams.name }),
        ...(searchParams.giftType && { giftType: searchParams.giftType }),
        ...(searchParams.theme && { theme: searchParams.theme }),
        ...(searchParams.includeWine && {
          includeWine: searchParams.includeWine,
        }),
        ...(searchParams.priceMin && { priceMin: searchParams.priceMin }),
        ...(searchParams.priceMax && { priceMax: searchParams.priceMax }),
        ...(searchParams.inStock && { inStock: searchParams.inStock }),
      }).toString();

      const response = await fetch(`/api/admin/gifts?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGifts(data.gifts);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error("Không thể tải danh sách quà tặng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quà tặng:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa quà tặng này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/gifts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });

      if (response.ok) {
        toast.success("Xóa quà tặng thành công");
        layDanhSachQuaTang();
      } else {
        const error = await response.json();
        toast.error(error.error || "Lỗi khi xóa quà tặng");
      }
    } catch (error) {
      console.error("Lỗi khi xóa quà tặng:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    }
  };

  const handleEdit = (gift: Gift) => {
    setSelectedGift(gift);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedGift(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedGift(null);
  };

  const handleFormSubmit = () => {
    handleFormClose();
    layDanhSachQuaTang();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getGiftTypeName = (type: string) => {
    switch (type) {
      case "set":
        return "Set quà";
      case "single":
        return "1 chai";
      case "combo":
        return "Combo";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý quà tặng</h1>
          <Button onClick={handleAdd} className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Thêm quà tặng
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={searchParams.name}
              onChange={(e) =>
                setSearchParams({ ...searchParams, name: e.target.value })
              }
              className="pl-10"
            />
          </div>
          <Select
            value={searchParams.giftType}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, giftType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Loại quà tặng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="set">Set quà</SelectItem>
              <SelectItem value="single">1 chai</SelectItem>
              <SelectItem value="combo">Combo</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchParams.includeWine}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, includeWine: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Kèm rượu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Có kèm rượu</SelectItem>
              <SelectItem value="false">Không kèm rượu</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchParams.inStock}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, inStock: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tình trạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Còn hàng</SelectItem>
              <SelectItem value="false">Hết hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gifts Table */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình ảnh</TableHead>
                <TableHead>Tên quà tặng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gifts.map((gift) => (
                <TableRow key={gift.id}>
                  <TableCell>
                    <div className="relative w-16 h-16">
                      <Image
                        src={gift.images[0] || "/placeholder-accessory.jpg"}
                        alt={gift.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{gift.name}</div>
                      <div className="text-sm text-gray-500">
                        {gift.theme && `Chủ đề: ${gift.theme}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="secondary">
                        {getGiftTypeName(gift.giftType)}
                      </Badge>
                      {gift.includeWine && (
                        <Badge variant="outline" className="text-green-600">
                          Kèm rượu
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatPrice(gift.price)}
                      </div>
                      {gift.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(gift.originalPrice)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={gift.inStock ? "default" : "destructive"}>
                        {gift.inStock ? "Còn hàng" : "Hết hàng"}
                      </Badge>
                      {gift.featured && (
                        <Badge variant="outline" className="text-yellow-600">
                          Nổi bật
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(gift)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(gift.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Hiển thị {(page - 1) * limit + 1} đến{" "}
            {Math.min(page * limit, total)} trong tổng số {total} quà tặng
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <span className="px-3 py-2 text-sm">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Gift Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedGift ? "Chỉnh sửa quà tặng" : "Thêm quà tặng mới"}
              </DialogTitle>
              <DialogDescription>
                {selectedGift
                  ? "Cập nhật thông tin quà tặng"
                  : "Thêm quà tặng mới vào hệ thống"}
              </DialogDescription>
            </DialogHeader>
            <GiftForm
              gift={selectedGift}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

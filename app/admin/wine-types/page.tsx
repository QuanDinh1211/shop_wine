"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Plus, Eye, Trash, Save } from "lucide-react";
import { WineType, Wine } from "@/lib/admin/types";
import { toast } from "sonner";

export default function TrangQuanLyLoaiRuou() {
  const [wineTypes, setWineTypes] = useState<WineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWineType, setSelectedWineType] = useState<WineType | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newWineTypeName, setNewWineTypeName] = useState("");
  const [editWineTypeName, setEditWineTypeName] = useState("");

  // Lấy danh sách loại rượu khi component được mount
  useEffect(() => {
    layDanhSachLoaiRuou();
  }, []);

  const layDanhSachLoaiRuou = async () => {
    try {
      const response = await fetch("/api/admin/wine-types", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWineTypes(data);
      } else {
        toast.error("Không thể tải danh sách loại rượu");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại rượu:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Thêm loại rượu mới
  const handleAddWineType = async () => {
    if (!newWineTypeName.trim()) {
      toast.error("Tên loại rượu không được để trống");
      return;
    }

    try {
      const response = await fetch("/api/admin/wine-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify({ name: newWineTypeName }),
      });

      if (response.ok) {
        const newWineType = await response.json();
        setWineTypes([...wineTypes, newWineType]);
        setNewWineTypeName("");
        setIsAddOpen(false);
        toast.success("Thêm loại rượu thành công");
      } else {
        toast.error("Không thể thêm loại rượu");
      }
    } catch (error) {
      console.error("Lỗi khi thêm loại rượu:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Cập nhật loại rượu
  const handleUpdateWineType = async (id: number) => {
    if (!editWineTypeName.trim()) {
      toast.error("Tên loại rượu không được để trống");
      return;
    }

    try {
      const response = await fetch(`/api/admin/wine-types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify({ name: editWineTypeName }),
      });

      if (response.ok) {
        setWineTypes(
          wineTypes.map((wineType) =>
            wineType.id === id
              ? { ...wineType, name: editWineTypeName }
              : wineType
          )
        );
        setSelectedWineType(
          selectedWineType
            ? { ...selectedWineType, name: editWineTypeName }
            : null
        );
        toast.success("Cập nhật loại rượu thành công");
      } else {
        toast.error("Không thể cập nhật loại rượu");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật loại rượu:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Xóa loại rượu
  const handleDeleteWineType = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/wine-types/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });

      if (response.ok) {
        setWineTypes(wineTypes.filter((wineType) => wineType.id !== id));
        setIsDetailsOpen(false);
        setSelectedWineType(null);
        toast.success("Xóa loại rượu thành công");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Không thể xóa loại rượu");
      }
    } catch (error) {
      console.error("Lỗi khi xóa loại rượu:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Lọc loại rượu dựa trên từ khóa tìm kiếm
  const filteredWineTypes = wineTypes.filter((wineType) =>
    wineType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Quản Lý Loại Rượu">
      <div className="space-y-6">
        {/* Hành động tiêu đề */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm loại rượu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Thêm loại rượu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm Loại Rượu Mới</DialogTitle>
                <DialogDescription>Nhập tên loại rượu mới</DialogDescription>
              </DialogHeader>
              <Input
                type="text"
                placeholder="Tên loại rượu"
                value={newWineTypeName}
                onChange={(e) => setNewWineTypeName(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddWineType}>Thêm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bảng danh sách loại rượu */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên Loại Rượu</TableHead>
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
              ) : filteredWineTypes.length > 0 ? (
                filteredWineTypes.map((wineType) => (
                  <TableRow key={wineType.id}>
                    <TableCell>{wineType.id}</TableCell>
                    <TableCell>{wineType.name}</TableCell>
                    <TableCell>
                      <Dialog
                        open={
                          isDetailsOpen && selectedWineType?.id === wineType.id
                        }
                        onOpenChange={(open) => {
                          setIsDetailsOpen(open);
                          if (!open) setSelectedWineType(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  `/api/admin/wine-types/${wineType.id}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${localStorage.getItem(
                                        "admin-token"
                                      )}`,
                                    },
                                  }
                                );
                                if (response.ok) {
                                  const data = await response.json();
                                  setSelectedWineType(data);
                                  setEditWineTypeName(data.name);
                                  setIsDetailsOpen(true);
                                } else {
                                  toast.error(
                                    "Không thể tải chi tiết loại rượu"
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Lỗi khi lấy chi tiết loại rượu:",
                                  error
                                );
                                toast.error("Lỗi hệ thống. Vui lòng thử lại.");
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Chi Tiết Loại Rượu</DialogTitle>
                            <DialogDescription>
                              Xem và chỉnh sửa thông tin loại rượu
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">
                                Thông tin loại rượu
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="text"
                                  value={editWineTypeName}
                                  onChange={(e) =>
                                    setEditWineTypeName(e.target.value)
                                  }
                                  placeholder="Tên loại rượu"
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateWineType(wineType.id)
                                  }
                                >
                                  <Save className="h-4 w-4 mr-2" /> Lưu
                                </Button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteWineType(wineType.id)}
                            >
                              <Trash className="h-4 w-4 mr-2" /> Xóa loại rượu
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy loại rượu
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

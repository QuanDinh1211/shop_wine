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
import { Country, Wine } from "@/lib/admin/types";
import { toast } from "sonner";

export default function TrangQuanLyQuocGia() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [editCountryName, setEditCountryName] = useState("");

  // Lấy danh sách quốc gia khi component được mount
  useEffect(() => {
    layDanhSachQuocGia();
  }, []);

  const layDanhSachQuocGia = async () => {
    try {
      const response = await fetch("/api/admin/countries", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCountries(data);
      } else {
        toast.error("Không thể tải danh sách quốc gia");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quốc gia:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Thêm quốc gia mới
  const handleAddCountry = async () => {
    if (!newCountryName.trim()) {
      toast.error("Tên quốc gia không được để trống");
      return;
    }

    try {
      const response = await fetch("/api/admin/countries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify({ name: newCountryName }),
      });

      if (response.ok) {
        await layDanhSachQuocGia();
        setNewCountryName("");
        setIsAddOpen(false);
        toast.success("Thêm quốc gia thành công");
      } else {
        toast.error("Không thể thêm quốc gia");
      }
    } catch (error) {
      console.error("Lỗi khi thêm quốc gia:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Cập nhật quốc gia
  const handleUpdateCountry = async (id: number) => {
    if (!editCountryName.trim()) {
      toast.error("Tên quốc gia không được để trống");
      return;
    }

    try {
      const response = await fetch(`/api/admin/countries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify({ name: editCountryName }),
      });

      if (response.ok) {
        setCountries(
          countries.map((country) =>
            country.id === id ? { ...country, name: editCountryName } : country
          )
        );
        setIsDetailsOpen(false);
        setSelectedCountry(null);
        toast.success("Cập nhật quốc gia thành công");
      } else {
        toast.error("Không thể cập nhật quốc gia");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật quốc gia:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Xóa quốc gia
  const handleDeleteCountry = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/countries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });

      if (response.ok) {
        setCountries(countries.filter((country) => country.id !== id));
        setIsDetailsOpen(false);
        setSelectedCountry(null);
        toast.success("Xóa quốc gia thành công");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Không thể xóa quốc gia");
      }
    } catch (error) {
      console.error("Lỗi khi xóa quốc gia:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Lọc quốc gia dựa trên từ khóa tìm kiếm
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Quản Lý Quốc Gia">
      <div className="space-y-6">
        {/* Hành động tiêu đề */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm quốc gia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Thêm quốc gia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm Quốc Gia Mới</DialogTitle>
                <DialogDescription>Nhập tên quốc gia mới</DialogDescription>
              </DialogHeader>
              <Input
                type="text"
                placeholder="Tên quốc gia"
                value={newCountryName}
                onChange={(e) => setNewCountryName(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddCountry}>Thêm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bảng danh sách quốc gia */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên Quốc Gia</TableHead>
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
              ) : filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell>{country.id}</TableCell>
                    <TableCell>{country.name}</TableCell>
                    <TableCell>
                      <Dialog
                        open={
                          isDetailsOpen && selectedCountry?.id === country.id
                        }
                        onOpenChange={(open) => {
                          setIsDetailsOpen(open);
                          if (!open) setSelectedCountry(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  `/api/admin/countries/${country.id}`,
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
                                  setSelectedCountry(data);
                                  setEditCountryName(data.name);
                                  setIsDetailsOpen(true);
                                } else {
                                  toast.error(
                                    "Không thể tải chi tiết quốc gia"
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Lỗi khi lấy chi tiết quốc gia:",
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
                            <DialogTitle>Chi Tiết Quốc Gia</DialogTitle>
                            <DialogDescription>
                              Xem và chỉnh sửa thông tin quốc gia
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">
                                Thông tin quốc gia
                              </h3>

                              <div className="flex items-center space-x-2">
                                <Input
                                  type="text"
                                  value={editCountryName}
                                  onChange={(e) =>
                                    setEditCountryName(e.target.value)
                                  }
                                  placeholder="Tên quốc gia"
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateCountry(country.id)
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
                              onClick={() => handleDeleteCountry(country.id)}
                            >
                              <Trash className="h-4 w-4 mr-2" /> Xóa quốc gia
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
                    Không tìm thấy quốc gia
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

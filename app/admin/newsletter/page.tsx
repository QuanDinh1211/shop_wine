"use client";

import { useEffect, useState } from "react";
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
import { Search, Plus, Trash } from "lucide-react";
import { NewsletterSubscriber } from "@/lib/admin/types";
import { toast } from "sonner";

export default function TrangQuanLyNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Lấy danh sách người đăng ký khi component được mount
  useEffect(() => {
    layDanhSachNguoiDangKy();
  }, []);

  const layDanhSachNguoiDangKy = async () => {
    try {
      const response = await fetch("/api/admin/newsletter", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      } else {
        toast.error("Không thể tải danh sách người đăng ký");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người đăng ký:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Thêm người đăng ký mới
  const handleAddSubscriber = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    try {
      const response = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (response.ok) {
        const newSubscriber = await response.json();
        setSubscribers([...subscribers, newSubscriber]);
        setNewEmail("");
        setIsAddOpen(false);
        toast.success("Thêm người đăng ký thành công");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Không thể thêm người đăng ký");
      }
    } catch (error) {
      console.error("Lỗi khi thêm người đăng ký:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Xóa người đăng ký
  const handleDeleteSubscriber = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });

      if (response.ok) {
        setSubscribers(
          subscribers.filter((subscriber) => subscriber.id !== id)
        );
        toast.success("Xóa người đăng ký thành công");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Không thể xóa người đăng ký");
      }
    } catch (error) {
      console.error("Lỗi khi xóa người đăng ký:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Lọc người đăng ký dựa trên từ khóa tìm kiếm
  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Quản Lý Đăng Ký Bản Tin">
      <div className="space-y-6">
        {/* Hành động tiêu đề */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Thêm người đăng ký
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm Người Đăng Ký Mới</DialogTitle>
                <DialogDescription>
                  Nhập email để thêm vào danh sách đăng ký
                </DialogDescription>
              </DialogHeader>
              <Input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddSubscriber}>Thêm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bảng danh sách người đăng ký */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Thời gian đăng ký</TableHead>
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
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>{subscriber.id}</TableCell>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>
                      {new Date(subscriber.subscribedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy người đăng ký
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

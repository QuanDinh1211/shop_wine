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
import { Search, Eye, Trash } from "lucide-react";
import { ContactMessage } from "@/lib/admin/types";
import { toast } from "sonner";

export default function TrangQuanLyTinNhan() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Lấy danh sách tin nhắn khi component được mount
  useEffect(() => {
    layDanhSachTinNhan();
  }, []);

  const layDanhSachTinNhan = async () => {
    try {
      const response = await fetch("/api/admin/messages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        toast.error("Không thể tải danh sách tin nhắn");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tin nhắn:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xóa tin nhắn
  const handleDeleteMessage = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });

      if (response.ok) {
        setMessages(messages.filter((message) => message.id !== id));
        setIsDetailsOpen(false);
        setSelectedMessage(null);
        toast.success("Xóa tin nhắn thành công");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Không thể xóa tin nhắn");
      }
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  // Lọc tin nhắn dựa trên từ khóa tìm kiếm
  const filteredMessages = messages.filter(
    (message) =>
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Quản Lý Tin Nhắn">
      <div className="space-y-6">
        {/* Hành động tiêu đề */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Bảng danh sách tin nhắn */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Chủ đề</TableHead>
                <TableHead>Thời gian gửi</TableHead>
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
                      <Skeleton className="h-4 w-48" />
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
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>{message.id}</TableCell>
                    <TableCell>{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>
                      {new Date(message.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={
                          isDetailsOpen && selectedMessage?.id === message.id
                        }
                        onOpenChange={(open) => {
                          setIsDetailsOpen(open);
                          if (!open) setSelectedMessage(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  `/api/admin/messages/${message.id}`,
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
                                  setSelectedMessage(data);
                                  setIsDetailsOpen(true);
                                } else {
                                  toast.error(
                                    "Không thể tải chi tiết tin nhắn"
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Lỗi khi lấy chi tiết tin nhắn:",
                                  error
                                );
                                toast.error("Lỗi hệ thống. Vui lòng thử lại.");
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Chi Tiết Tin Nhắn</DialogTitle>
                            <DialogDescription>
                              Xem thông tin chi tiết tin nhắn
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">
                                Thông tin tin nhắn
                              </h3>

                              <p>
                                <strong>Tên:</strong> {message.name}
                              </p>
                              <p>
                                <strong>Email:</strong> {message.email}
                              </p>
                              <p>
                                <strong>Chủ đề:</strong> {message.subject}
                              </p>
                              <p>
                                <strong>Thời gian gửi:</strong>{" "}
                                {new Date(message.createdAt).toLocaleString(
                                  "vi-VN"
                                )}
                              </p>
                              <p>
                                <strong>Nội dung:</strong>
                              </p>
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {message.message}
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash className="h-4 w-4 mr-2" /> Xóa tin nhắn
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
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy tin nhắn
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

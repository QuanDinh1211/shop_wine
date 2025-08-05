"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Plus,
  Edit,
  Trash,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [overviewData, setOverviewData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalWines: 0,
    pendingOrders: 0,
    lowStockWines: 0,
  });
  const [wines, setWines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [wineTypes, setWineTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newWine, setNewWine] = useState({
    name: "",
    wine_type_id: "",
    country_id: "",
    region: "",
    year: "",
    price: "",
    original_price: "",
    description: "",
    images: "",
    in_stock: true,
    featured: false,
    alcohol: "",
    volume: "",
    winery: "",
    serving_temp: "",
    stock_quantity: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      toast.error("Bạn không có quyền truy cập trang này");
      router.push("/");
      return;
    }

    fetchOverviewData();
    fetchWines();
    fetchOrders();
    fetchCustomers();
    fetchWineTypes();
    fetchCountries();
  }, [user, router]);

  const fetchOverviewData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/overview`
      );
      const data = await res.json();
      if (res.ok) {
        setOverviewData(data);
      } else {
        throw new Error(data.error || "Lỗi khi tải dữ liệu tổng quan");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWines = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/wines`
      );
      const data = await res.json();
      if (res.ok) {
        setWines(data);
      } else {
        throw new Error(data.error || "Lỗi khi tải danh sách rượu");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/orders`
      );
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        throw new Error(data.error || "Lỗi khi tải danh sách đơn hàng");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/customers`
      );
      const data = await res.json();
      if (res.ok) {
        setCustomers(data);
      } else {
        throw new Error(data.error || "Lỗi khi tải danh sách khách hàng");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchWineTypes = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/wine-types`
      );
      const data = await res.json();
      if (res.ok) {
        setWineTypes(data);
      } else {
        throw new Error(data.error || "Lỗi khi tải danh sách loại rượu");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/countries`
      );
      const data = await res.json();
      if (res.ok) {
        setCountries(data);
      } else {
        throw new Error(data.error || "Lỗi khi tải danh sách quốc gia");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddWine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newWine.name ||
      !newWine.wine_type_id ||
      !newWine.country_id ||
      !newWine.price ||
      !newWine.stock_quantity
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/wines`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newWine,
            images: newWine.images ? JSON.parse(newWine.images) : [],
            id: `wine_${Date.now()}`,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi thêm rượu");
      }
      toast.success("Thêm rượu thành công!");
      setNewWine({
        name: "",
        wine_type_id: "",
        country_id: "",
        region: "",
        year: "",
        price: "",
        original_price: "",
        description: "",
        images: "",
        in_stock: true,
        featured: false,
        alcohol: "",
        volume: "",
        winery: "",
        serving_temp: "",
        stock_quantity: "",
      });
      setIsDialogOpen(false);
      fetchWines();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi cập nhật trạng thái đơn hàng");
      }
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteWine = async (wineId: string) => {
    if (!confirm("Bạn có chắc muốn xóa rượu này?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/wines/${wineId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi xóa rượu");
      }
      toast.success("Xóa rượu thành công!");
      fetchWines();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const revenueData = [
    { name: "Tháng 1", revenue: 40000000 },
    { name: "Tháng 2", revenue: 50000000 },
    { name: "Tháng 3", revenue: 60000000 },
    // Thêm dữ liệu thực tế từ API sau
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Bảng Điều Khiển Quản Trị
        </h1>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="wines">Rượu</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-6 w-6 text-red-600" />
                    <span>Tổng doanh thu</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {overviewData.totalRevenue.toLocaleString()} VND
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-6 w-6 text-red-600" />
                    <span>Tổng đơn hàng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {overviewData.totalOrders}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-6 w-6 text-red-600" />
                    <span>Tổng sản phẩm rượu</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {overviewData.totalWines}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <span>Đơn hàng đang chờ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {overviewData.pendingOrders}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <span>Rượu sắp hết hàng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {overviewData.lowStockWines}
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* <Card className="mt-6">
              <CardHeader>
                <CardTitle>Biểu đồ doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#b91c1c" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card> */}
          </TabsContent>

          <TabsContent value="wines">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Quản lý rượu</span>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="h-5 w-5 mr-2" /> Thêm rượu
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Thêm rượu mới</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddWine} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Tên rượu</Label>
                            <Input
                              id="name"
                              value={newWine.name}
                              onChange={(e) =>
                                setNewWine({ ...newWine, name: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="wine_type_id">Loại rượu</Label>
                            <Select
                              value={newWine.wine_type_id}
                              onValueChange={(value) =>
                                setNewWine({ ...newWine, wine_type_id: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại rượu" />
                              </SelectTrigger>
                              <SelectContent>
                                {wineTypes.map((type: any) => (
                                  <SelectItem
                                    key={type.wine_type_id}
                                    value={type.wine_type_id.toString()}
                                  >
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="country_id">Quốc gia</Label>
                            <Select
                              value={newWine.country_id}
                              onValueChange={(value) =>
                                setNewWine({ ...newWine, country_id: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn quốc gia" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country: any) => (
                                  <SelectItem
                                    key={country.country_id}
                                    value={country.country_id.toString()}
                                  >
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="region">Vùng</Label>
                            <Input
                              id="region"
                              value={newWine.region}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  region: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="year">Năm sản xuất</Label>
                            <Input
                              id="year"
                              type="number"
                              value={newWine.year}
                              onChange={(e) =>
                                setNewWine({ ...newWine, year: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Giá (VND)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={newWine.price}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  price: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="original_price">
                              Giá gốc (VND)
                            </Label>
                            <Input
                              id="original_price"
                              type="number"
                              value={newWine.original_price}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  original_price: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="stock_quantity">
                              Số lượng tồn kho
                            </Label>
                            <Input
                              id="stock_quantity"
                              type="number"
                              value={newWine.stock_quantity}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  stock_quantity: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="alcohol">Nồng độ cồn (%)</Label>
                            <Input
                              id="alcohol"
                              type="number"
                              step="0.1"
                              value={newWine.alcohol}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  alcohol: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="volume">Dung tích (ml)</Label>
                            <Input
                              id="volume"
                              type="number"
                              value={newWine.volume}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  volume: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="winery">Nhà sản xuất</Label>
                            <Input
                              id="winery"
                              value={newWine.winery}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  winery: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="serving_temp">
                              Nhiệt độ phục vụ
                            </Label>
                            <Input
                              id="serving_temp"
                              value={newWine.serving_temp}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  serving_temp: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Input
                              id="description"
                              value={newWine.description}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="images">
                              Hình ảnh (JSON array)
                            </Label>
                            <Input
                              id="images"
                              value={newWine.images}
                              onChange={(e) =>
                                setNewWine({
                                  ...newWine,
                                  images: e.target.value,
                                })
                              }
                              placeholder='["url1", "url2"]'
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          Thêm rượu
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Quốc gia</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Tồn kho</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wines.map((wine: any) => (
                      <TableRow key={wine.id}>
                        <TableCell>{wine.id}</TableCell>
                        <TableCell>{wine.name}</TableCell>
                        <TableCell>{wine.wine_type_name}</TableCell>
                        <TableCell>{wine.country_name}</TableCell>
                        <TableCell>{wine.price.toLocaleString()} VND</TableCell>
                        <TableCell>{wine.stock_quantity}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2">
                            <Edit className="h-4 w-4" /> Sửa
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteWine(wine.id)}
                          >
                            <Trash className="h-4 w-4" /> Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: any) => (
                      <TableRow key={order.order_id}>
                        <TableCell>{order.order_id}</TableCell>
                        <TableCell>{order.full_name}</TableCell>
                        <TableCell>
                          {order.total_amount.toLocaleString()} VND
                        </TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>
                          {new Date(order.order_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleUpdateOrderStatus(order.order_id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Đang chờ</SelectItem>
                              <SelectItem value="processing">
                                Đang xử lý
                              </SelectItem>
                              <SelectItem value="shipped">Đã giao</SelectItem>
                              <SelectItem value="delivered">Đã nhận</SelectItem>
                              <SelectItem value="cancelled">Hủy</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Admin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.id}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>
                          {customer.isAdmin ? "Có" : "Không"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

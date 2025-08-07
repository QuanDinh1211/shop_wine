// Wine hiển thị cho người dùng (đã xử lý đầy đủ các mối liên kết)
export interface Wine {
  id: string;
  name: string;
  wineTypeId: number; // từ WineTypes.name
  type: string; // từ WineTypes.name
  country: string; // từ Countries.name
  countryId: number;
  region: string | null;
  year: number | null;
  price: number;
  originalPrice: number | null;
  rating: number | null;
  reviews: number;
  description: string | null;
  images: string[];
  inStock: boolean;
  featured: boolean;
  alcohol: number | null;
  volume: number | null;
  winery: string | null;
  servingTemp: string | null;
  grapes: string[]; // từ WineGrapes + Grapes.name
  pairings: string[]; // từ WinePairings + Pairings.name
}

// Dữ liệu tạo/cập nhật rượu cho form admin
export interface WineFormData {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  alcohol_content: string;
  vintage: string;
  country_id: string;
  wine_type_id: string;
  images: string[];
  grape_ids: number[];
  pairing_ids: number[];
}

// Các mục danh mục chung (dùng cho dropdown hoặc quản lý)
export interface Country {
  id: number;
  name: string;
}

export interface WineType {
  id: number;
  name: string;
}

export interface Grape {
  id: number;
  name: string;
}

export interface Pairing {
  id: number;
  name: string;
}

// Dùng trong giỏ hàng
export interface CartItem {
  wine: Wine;
  quantity: number;
  unitPrice: number;
}

// Đơn hàng
export interface Order {
  id: string;
  userId: string;
  orderCode: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  paymentMethod: "cod" | "bank" | "card";
  notes: string | null;
}

// Bộ lọc dùng cho UI
export interface FilterOptions {
  type: string[];
  country: string[];
  priceRange: [number, number];
  year: [number, number];
  rating: number;
}

// Người dùng
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  isAdmin: boolean;
  orders?: Order[];
}

// Dữ liệu dashboard tổng quan
export interface DashboardStats {
  totalWines: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

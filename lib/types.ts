export interface Wine {
  id: string;
  name: string;
  type: string; // Lấy từ WineTypes.name
  country: string; // Lấy từ Countries.name
  region: string | null;
  year: number | null;
  price: number;
  originalPrice: number | null;
  rating: number | null;
  reviews: number;
  description: string | null;
  images: string[]; // Parse từ JSON trong cột images
  inStock: boolean;
  featured: boolean;
  alcohol: number | null;
  volume: number | null;
  winery: string | null;
  servingTemp: string | null;
  grapes: string[]; // Lấy từ WineGrapes + Grapes.name
  pairings: string[]; // Lấy từ WinePairings + Pairings.name
}

export interface CartItem {
  wine?: Wine;
  accessory?: Accessory;
  quantity: number;
  productType: 'wine' | 'accessory';
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  userId: string;
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
}

export interface FilterOptions {
  type: string[];
  country: string[];
  priceRange: [number, number];
  year: [number, number];
  rating: number;
}

export interface DashboardStats {
  totalWines: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export interface AccessoryType {
  accessoryTypeId: number;
  name: string;
}

export interface Accessory {
  id: string;
  name: string;
  accessoryTypeId: number;
  accessoryType: string;
  price: number;
  originalPrice: number | null;
  description: string | null;
  images: string[];
  inStock: boolean;
  featured: boolean;
  brand: string | null;
  material: string | null;
  color: string | null;
  size: string | null;
}

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
  grapes: string[]; // Lấy từ WineGrapes + Grapes
  pairings: string[]; // Lấy từ WinePairings + Pairings
}

export interface CartItem {
  wine: Wine;
  quantity: number;
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
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  paymentMethod: 'cod' | 'bank_transfer';
}

export interface FilterOptions {
  type: string[];
  country: string[];
  priceRange: [number, number];
  year: [number, number];
  rating: number;
}
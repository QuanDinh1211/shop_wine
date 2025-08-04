export interface Wine {
  id: string;
  name: string;
  type: 'red' | 'white' | 'rose' | 'sparkling';
  country: string;
  region: string;
  year: number;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  description: string;
  images: string[];
  inStock: boolean;
  featured: boolean;
  alcohol: number;
  volume: number;
  grapes: string[];
  winery: string;
  servingTemp: string;
  pairings: string[];
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
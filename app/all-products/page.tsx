"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Search,
  Filter,
  Grid,
  List,
  Wine,
  Gift,
  Package,
  Star,
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/products/ProductCard";
import { AccessoryCard } from "@/components/products/AccessoryCard";
import GiftCard from "@/components/products/GiftCard";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "wine" | "accessory" | "gift";
  type?: string;
  country?: string;
  year?: number;
  rating?: number;
  description?: string;
}

// API call function
const fetchProducts = async (params: {
  category?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set("category", params.category);
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.offset) searchParams.set("offset", params.offset.toString());

  const response = await fetch(`/api/products/all?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
};

const CATEGORIES = [
  { value: "all", label: "Tất cả", icon: Package },
  { value: "wine", label: "Rượu vang", icon: Wine },
  { value: "accessory", label: "Phụ kiện", icon: Package },
  { value: "gift", label: "Quà tặng", icon: Gift },
];

const SORT_OPTIONS = [
  { value: "name-asc", label: "Tên A-Z" },
  { value: "name-desc", label: "Tên Z-A" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "rating-desc", label: "Đánh giá cao nhất" },
  { value: "newest", label: "Mới nhất" },
];

export default function AllProductsPage() {
  const searchParams = useSearchParams();
  const defaultSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProducts({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          search: searchTerm || undefined,
          sortBy,
          limit: pagination.limit,
          offset: pagination.offset,
        });

        if (result.success) {
          setProducts(result.data);
          setPagination(result.pagination);
        } else {
          setError("Failed to load products");
        }
      } catch (err) {
        setError("Failed to load products");
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [
    selectedCategory,
    searchTerm,
    sortBy,
    pagination.limit,
    pagination.offset,
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = CATEGORIES.find((cat) => cat.value === category);
    return categoryData?.icon || Package;
  };

  const getCategoryLabel = (category: string) => {
    const categoryData = CATEGORIES.find((cat) => cat.value === category);
    return categoryData?.label || "Khác";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Khám phá bộ sưu tập đa dạng
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-red-100">
              Rượu vang, phụ kiện và quà tặng cao cấp từ khắp nơi trên thế giới
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
                <Wine className="h-5 w-5" />
                <span>Rượu vang cao cấp</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
                <Package className="h-5 w-5" />
                <span>Phụ kiện chuyên nghiệp</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
                <Gift className="h-5 w-5" />
                <span>Quà tặng độc đáo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Tất cả sản phẩm
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Lựa chọn từ hàng trăm sản phẩm chất lượng cao
          </p>
        </div>

        {/* Filters and Search */}
        <div className="sticky top-16 z-10 bg-gray-50 dark:bg-gray-900 pt-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-search"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 min-w-0">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="flex-1 min-w-0 sm:w-48">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 min-w-0 sm:w-48">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border rounded-md flex-shrink-0">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Hiển thị {products.length} sản phẩm
            {pagination.total > 0 &&
              ` trong tổng số ${pagination.total} sản phẩm`}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Đang tải sản phẩm...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Thử lại
            </Button>
          </div>
        )}

        {/* Products Grid/List */}
        {!loading && !error && products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              variant="outline"
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2"
                : "space-y-4"
            }
          >
            {products.map((product: any) => {
              // Render different card based on product category
              switch (product.category) {
                case "wine":
                  // Convert API data to Wine type for ProductCard
                  const wineData = {
                    id: product.id,
                    name: product.name,
                    wineTypeId: 0, // Default value
                    type: product.type || "",
                    country: product.country || "",
                    countryId: 0, // Default value
                    region: product.region || null,
                    year: product.year || null,
                    price: product.price,
                    originalPrice: product.originalPrice || null,
                    rating: product.rating || 0,
                    reviews: 0, // Default value
                    description: product.description || null,
                    images: product.images || [],
                    inStock: product.inStock,
                    featured: product.featured,
                    alcohol: product.alcohol || null,
                    volume: product.volume || null,
                    winery: product.brand || null,
                    servingTemp: null,
                    grapes: product.grapes || [],
                    pairings: [],
                  };
                  return (
                    <ProductCard
                      key={product.id}
                      wine={wineData}
                      variant={viewMode === "list" ? "compact" : "default"}
                    />
                  );

                case "accessory":
                  // Convert API data to Accessory type for AccessoryCard
                  const accessoryData = {
                    id: product.id,
                    name: product.name,
                    accessoryTypeId: 0, // Default value
                    accessoryType: product.type || "",
                    price: product.price,
                    originalPrice: product.originalPrice || null,
                    description: product.description || null,
                    images: product.images || [],
                    inStock: product.inStock,
                    featured: product.featured,
                    brand: product.brand || null,
                    material: null,
                    color: null,
                    size: null,
                  };
                  return (
                    <AccessoryCard
                      key={product.id}
                      accessory={accessoryData}
                      variant={viewMode === "list" ? "compact" : "default"}
                    />
                  );

                case "gift":
                  // Convert API data to Gift type for GiftCard
                  const giftData = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice || null,
                    description: product.description || null,
                    images: product.images || [],
                    inStock: product.inStock,
                    featured: product.featured,
                    giftType: product.type || "set",
                    includeWine: false, // Default value
                    theme: null,
                    packaging: null,
                    items: [],
                  };
                  return (
                    <GiftCard
                      key={product.id}
                      gift={giftData}
                      variant={viewMode === "list" ? "compact" : "default"}
                    />
                  );

                default:
                  // Fallback to ProductCard for unknown categories
                  const defaultWineData = {
                    id: product.id,
                    name: product.name,
                    wineTypeId: 0,
                    type: product.type || "",
                    country: product.country || "",
                    countryId: 0,
                    region: product.region || null,
                    year: product.year || null,
                    price: product.price,
                    originalPrice: product.originalPrice || null,
                    rating: product.rating || 0,
                    reviews: 0,
                    description: product.description || null,
                    images: product.images || [],
                    inStock: product.inStock,
                    featured: product.featured,
                    alcohol: product.alcohol || null,
                    volume: product.volume || null,
                    winery: product.brand || null,
                    servingTemp: null,
                    grapes: product.grapes || [],
                    pairings: [],
                  };
                  return (
                    <ProductCard
                      key={product.id}
                      wine={defaultWineData}
                      variant={viewMode === "list" ? "compact" : "default"}
                    />
                  );
              }
            })}
          </div>
        )}

        {/* Load more button */}
        {!loading && !error && pagination.hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={() => {
                setPagination((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }));
              }}
              variant="outline"
              size="lg"
            >
              Tải thêm sản phẩm
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

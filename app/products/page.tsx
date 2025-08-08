"use client";

import { useState, useMemo, useEffect } from "react";
import { Wine, FilterOptions } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Grid, List, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Component, ReactNode } from "react";
import ProductsServer from "./ProductsServer";

const ProductFilters = dynamic(
  () => import("@/components/products/ProductFilters"),
  {
    ssr: false,
    loading: () => <p>Đang tải bộ lọc...</p>,
  }
);

// Error Boundary Component
type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

type SortOption =
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "name-asc"
  | "year-desc";

function ProductsContent({ initialWines }: { initialWines: Wine[] }) {
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type")?.split(",") || [];
  const defaultSearch = searchParams.get("search") || "";

  const [filters, setFilters] = useState<FilterOptions>({
    type: defaultType,
    country: [],
    priceRange: [500000, 10000000],
    year: [new Date().getFullYear() - 20, new Date().getFullYear()],
    rating: 1,
  });
  const [searchText, setSearchText] = useState(defaultSearch);
  const [debouncedSearch] = useDebounce(searchText, 500);
  const [sortBy, setSortBy] = useState<SortOption>("rating-desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredAndSortedWines = useMemo(() => {
    let filtered = initialWines.filter((wine) => {
      if (
        debouncedSearch &&
        !wine.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false;
      }
      if (filters.type.length > 0 && !filters.type.includes(wine.type)) {
        return false;
      }
      if (
        filters.country.length > 0 &&
        !filters.country.includes(wine.country)
      ) {
        return false;
      }
      if (
        wine.price < filters.priceRange[0] ||
        wine.price > filters.priceRange[1]
      ) {
        return false;
      }
      if (
        wine.year &&
        (wine.year < filters.year[0] || wine.year > filters.year[1])
      ) {
        return false;
      }
      if (wine.rating && wine.rating < filters.rating) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "year-desc":
          return (b.year || 0) - (a.year || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters, sortBy, debouncedSearch, initialWines]);

  const clearFilters = () => {
    setFilters({
      type: [],
      country: [],
      priceRange: [500000, 10000000],
      year: [new Date().getFullYear() - 20, new Date().getFullYear()],
      rating: 1,
    });
    setSearchText("");
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    if (filters.type.length > 0) {
      params.set("type", filters.type.join(","));
    } else {
      params.delete("type");
    }
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedSearch, filters.type, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Sản phẩm
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Khám phá bộ sưu tập rượu vang cao cấp từ khắp nơi trên thế giới
          </p>
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="pl-10 input-search"
                  />
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden flex-shrink-0"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full max-w-[90vw] sm:max-w-[320px] overflow-y-auto"
                  >
                    <div className="py-4">
                      <ProductFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        onClearFilters={clearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <span className="hidden lg:inline text-sm text-gray-600 dark:text-gray-400 truncate">
                  {filteredAndSortedWines.length} sản phẩm
                </span>
              </div>

              <div className="flex items-center justify-end gap-4 min-w-0">
                <Select
                  value={sortBy}
                  onValueChange={(value: SortOption) => setSortBy(value)}
                >
                  <SelectTrigger className="flex-1 min-w-0 sm:w-48">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating-desc">
                      Đánh giá cao nhất
                    </SelectItem>
                    <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                    <SelectItem value="name-asc">Tên A-Z</SelectItem>
                    <SelectItem value="year-desc">Năm mới nhất</SelectItem>
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

            {filteredAndSortedWines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAndSortedWines.map((wine) => (
                  <ProductCard
                    key={wine.id}
                    wine={wine}
                    variant={viewMode === "list" ? "compact" : "default"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null | boolean>(null);

  useEffect(() => {
    async function fetchWines() {
      setIsLoading(true);
      const { wines, error } = await ProductsServer();
      setWines(wines);
      setError(error);
      setIsLoading(false);
    }
    fetchWines();
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Đã xảy ra lỗi khi tải sản phẩm</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="text-center py-12">
          <p className="text-red-500">Đã xảy ra lỗi khi tải sản phẩm.</p>
        </div>
      }
    >
      <ProductsContent initialWines={wines} />
    </ErrorBoundary>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex gap-8">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

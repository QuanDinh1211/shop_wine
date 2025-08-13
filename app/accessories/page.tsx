"use client";

import React, { useState, useEffect, useRef } from "react";
import { AccessoryCard } from "@/components/products/AccessoryCard";
import { AccessoryFilters } from "@/components/products/AccessoryFilters";
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
import { Accessory } from "@/lib/types";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "featured-desc";

export default function AccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  const fetchAccessories = async (appliedFilters?: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "500", // Tăng limit để có thể filter client-side
      });

      if (appliedFilters) {
        if (appliedFilters.name) params.append("name", appliedFilters.name);
        // Allow passing direct type name from URL without mapping by id
        if (appliedFilters.typeNameDirect) {
          params.append("type", appliedFilters.typeNameDirect);
        }
        if (appliedFilters.types?.length > 0) {
          const selectedTypes = filters.types
            .filter((type: any) => appliedFilters.types.includes(type.id))
            .map((type: any) => type.name);
          params.append("type", selectedTypes.join(","));
        }
        if (appliedFilters.brands?.length > 0) {
          params.append("brand", appliedFilters.brands.join(","));
        }
        if (appliedFilters.colors?.length > 0) {
          params.append("color", appliedFilters.colors.join(","));
        }
        if (appliedFilters.priceRange) {
          params.append("priceMin", appliedFilters.priceRange[0].toString());
          params.append("priceMax", appliedFilters.priceRange[1].toString());
        }
        if (appliedFilters.inStock) {
          params.append("inStock", "true");
        }
      }

      const response = await fetch(`/api/accessories?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAccessories(data.accessories);
      } else {
        console.error("Lỗi khi tải phụ kiện:", data.error);
      }
    } catch (error) {
      console.error("Lỗi khi tải phụ kiện:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/filters/accessories");
      const data = await response.json();

      if (response.ok) {
        setFilters(data);
      } else {
        console.error("Lỗi khi tải bộ lọc:", data.error);
      }
    } catch (error) {
      console.error("Lỗi khi tải bộ lọc:", error);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const searchParams = useSearchParams();
  const hasLoadedByTypeRef = useRef(false);

  // Load initial data, respecting ?type= in URL
  useEffect(() => {
    if (!filters) return;

    const typeParamRaw = searchParams.get("type");
    if (typeParamRaw && !hasLoadedByTypeRef.current) {
      const typeParam = decodeURIComponent(typeParamRaw).toLowerCase();
      // Map common keys to Vietnamese names keywords
      const keywordMap: Record<string, string[]> = {
        decanter: ["decanter", "bình thở"],
        goblet: ["ly"],
        opener: ["mở", "dụng cụ mở"],
      };
      const keywords = keywordMap[typeParam] || [typeParam];

      const matched = filters.types.find((t: any) =>
        keywords.some((k) => String(t.name).toLowerCase().includes(k))
      );

      if (matched) {
        fetchAccessories({ types: [matched.id] });
      } else {
        // Fallback: pass raw type name directly to API
        fetchAccessories({ typeNameDirect: typeParamRaw });
      }
      hasLoadedByTypeRef.current = true;
      return;
    }

    if (!hasLoadedByTypeRef.current) {
      fetchAccessories();
      hasLoadedByTypeRef.current = true;
    }
  }, [filters, searchParams]);

  // Search is applied client-side on the loaded dataset, no refetch needed

  const handleFiltersChange = (newFilters: any) => {
    fetchAccessories(newFilters);
  };

  const handleClearFilters = () => {
    fetchAccessories();
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
  };

  const filteredAndSortedAccessories = React.useMemo(() => {
    let filtered = accessories.filter((accessory) => {
      if (
        debouncedSearch &&
        !accessory.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "featured-desc":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [accessories, sortBy, debouncedSearch]);

  if (!filters) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="relative h-64 md:h-96">
        <Image
          src="https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"
          alt="Bộ sưu tập phụ kiện rượu vang"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Phụ kiện</h1>
            <p className="text-lg md:text-xl max-w-2xl">
              Khám phá bộ sưu tập phụ kiện cao cấp cho trải nghiệm thưởng rượu
              hoàn hảo
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <AccessoryFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                externalFilters={{
                  types: (() => {
                    const typeParamRaw = searchParams.get("type");
                    if (!typeParamRaw) return undefined;
                    const typeParam =
                      decodeURIComponent(typeParamRaw).toLowerCase();
                    const keywordMap: Record<string, string[]> = {
                      decanter: ["decanter", "bình thở"],
                      goblet: ["ly"],
                      opener: ["mở", "dụng cụ mở"],
                    };
                    const keywords = keywordMap[typeParam] || [typeParam];
                    const matched = filters.types.find((t: any) =>
                      keywords.some((k) =>
                        String(t.name).toLowerCase().includes(k)
                      )
                    );
                    return matched ? [matched.id] : undefined;
                  })(),
                }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="sticky top-16 z-10 lg:static grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm phụ kiện..."
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
                    className="w-full max-w-[90vw] sm:max-w-[320px] overflow-y-auto z-[9999]"
                  >
                    <div className="py-4">
                      <AccessoryFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <span className="hidden lg:inline text-sm text-gray-600 dark:text-gray-400 truncate">
                  {filteredAndSortedAccessories.length} phụ kiện
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
                    <SelectItem value="name-asc">Tên A-Z</SelectItem>
                    <SelectItem value="name-desc">Tên Z-A</SelectItem>
                    <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                    <SelectItem value="featured-desc">Nổi bật</SelectItem>
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

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : filteredAndSortedAccessories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Không tìm thấy phụ kiện nào phù hợp với bộ lọc của bạn.
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2"
                    : "space-y-4"
                }
              >
                {filteredAndSortedAccessories.map((accessory) => (
                  <AccessoryCard
                    key={accessory.id}
                    accessory={accessory}
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

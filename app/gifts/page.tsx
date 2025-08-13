"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import GiftCard from "@/components/products/GiftCard";
import {
  GiftFilters,
  GiftFilterOptions,
} from "@/components/products/GiftFilters";
import { Gift } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Grid, List } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "price-asc" | "price-desc" | "name-asc";

export default function GiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<GiftFilterOptions | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 400);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      const hasLocalFilters = Boolean(
        (appliedFilters.giftTypes && appliedFilters.giftTypes.length > 0) ||
          typeof appliedFilters.includeWine === "boolean" ||
          appliedFilters.theme ||
          appliedFilters.priceRange ||
          debouncedSearch
      );
      const giftType = hasLocalFilters
        ? appliedFilters.giftTypes?.join(",")
        : searchParams.get("giftType");
      const includeWine = hasLocalFilters
        ? typeof appliedFilters.includeWine === "boolean"
          ? String(appliedFilters.includeWine)
          : ""
        : searchParams.get("includeWine");
      const theme = hasLocalFilters
        ? appliedFilters.theme
        : searchParams.get("theme");
      const priceRange = (
        hasLocalFilters ? appliedFilters.priceRange : undefined
      ) as [number, number] | undefined;
      if (giftType) sp.append("giftType", giftType);
      if (includeWine === "true") sp.append("includeWine", includeWine);
      if (theme) sp.append("theme", theme);
      const name = (appliedFilters.name as string) || debouncedSearch;
      if (name && name.trim()) sp.append("name", name.trim());
      if (priceRange) {
        sp.append("priceMin", String(priceRange[0]));
        sp.append("priceMax", String(priceRange[1]));
      }
      sp.append("limit", "500");
      const res = await fetch(`/api/gifts?${sp.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải quà tặng");
      setGifts(data.gifts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch(`/api/filters/gifts`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Không thể tải bộ lọc quà tặng");
      setOptions(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchGifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, appliedFilters, debouncedSearch]);

  const sortedGifts = React.useMemo(() => {
    const sorted = [...gifts];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    return sorted;
  }, [gifts, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="relative h-64 md:h-96">
        <Image
          src="https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg"
          alt="Bộ quà tặng rượu vang"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Quà tặng</h1>
            <p className="text-lg md:text-xl max-w-2xl">
              Set quà tinh tế, phù hợp mọi dịp: Tết, Noel, sinh nhật, tri ân đối
              tác.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              {options && (
                <GiftFilters
                  options={options}
                  onFiltersChange={(f) => setAppliedFilters(f)}
                  onClearFilters={() => setAppliedFilters({})}
                />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="sticky top-16 z-10 lg:static grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm quà tặng..."
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
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full max-w-[90vw] sm:max-w-[320px] overflow-y-auto z-[9999]"
                  >
                    <div className="py-4">
                      {options && (
                        <GiftFilters
                          options={options}
                          onFiltersChange={(f) => setAppliedFilters(f)}
                          onClearFilters={() => setAppliedFilters({})}
                        />
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
                <span className="hidden lg:inline text-sm text-gray-600 dark:text-gray-400 truncate">
                  {gifts.length} quà tặng
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
                    <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
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
            ) : sortedGifts.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                Không có quà tặng phù hợp.
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2"
                    : "space-y-4"
                }
              >
                {sortedGifts.map((g) => (
                  <GiftCard
                    key={g.id}
                    gift={g}
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

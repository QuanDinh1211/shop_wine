'use client';

import { useState, useMemo } from 'react';
import { wines } from '@/lib/data/wines';
import { FilterOptions } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Grid, List } from 'lucide-react';

type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc' | 'year-desc';

export default function ProductsPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    country: [],
    priceRange: [500000, 10000000],
    year: [2010, 2024],
    rating: 1,
  });
  
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAndSortedWines = useMemo(() => {
    let filtered = wines.filter(wine => {
      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(wine.type)) {
        return false;
      }

      // Country filter
      if (filters.country.length > 0 && !filters.country.includes(wine.country)) {
        return false;
      }

      // Price filter
      if (wine.price < filters.priceRange[0] || wine.price > filters.priceRange[1]) {
        return false;
      }

      // Year filter
      if (wine.year < filters.year[0] || wine.year > filters.year[1]) {
        return false;
      }

      // Rating filter
      if (wine.rating < filters.rating) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'year-desc':
          return b.year - a.year;
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters, sortBy]);

  const clearFilters = () => {
    setFilters({
      type: [],
      country: [],
      priceRange: [500000, 10000000],
      year: [2010, 2024],
      rating: 1,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Sản phẩm
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Khám phá bộ sưu tập rượu vang cao cấp từ khắp nơi trên thế giới
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <div className="py-4">
                      <ProductFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        onClearFilters={clearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredAndSortedWines.length} sản phẩm
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating-desc">Đánh giá cao nhất</SelectItem>
                    <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                    <SelectItem value="name-asc">Tên A-Z</SelectItem>
                    <SelectItem value="year-desc">Năm mới nhất</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
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
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredAndSortedWines.map(wine => (
                  <ProductCard
                    key={wine.id}
                    wine={wine}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
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
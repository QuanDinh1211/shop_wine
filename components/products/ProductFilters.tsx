'use client';

import { useState } from 'react';
import { FilterOptions } from '@/lib/types';
import { countries, wineTypes } from '@/lib/data/wines';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ProductFiltersProps) {
  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.type, type]
      : filters.type.filter(t => t !== type);
    onFiltersChange({ ...filters, type: newTypes });
  };

  const handleCountryChange = (country: string, checked: boolean) => {
    const newCountries = checked
      ? [...filters.country, country]
      : filters.country.filter(c => c !== country);
    onFiltersChange({ ...filters, country: newCountries });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'red':
        return 'Đỏ';
      case 'white':
        return 'Trắng';
      case 'rose':
        return 'Hồng';
      case 'sparkling':
        return 'Sủi bọt';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bộ lọc</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc
        </Button>
      </div>

      {/* Wine Type Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Loại rượu vang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {wineTypes.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.type.includes(type)}
                onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm">
                {getTypeName(type)}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Country Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quốc gia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {countries.map(country => (
            <div key={country} className="flex items-center space-x-2">
              <Checkbox
                id={`country-${country}`}
                checked={filters.country.includes(country)}
                onCheckedChange={(checked) => handleCountryChange(country, checked as boolean)}
              />
              <Label htmlFor={`country-${country}`} className="text-sm">
                {country}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Khoảng giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, priceRange: value as [number, number] })
              }
              max={10000000}
              min={500000}
              step={100000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Năm sản xuất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={filters.year}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, year: value as [number, number] })
              }
              max={2024}
              min={2010}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{filters.year[0]}</span>
              <span>{filters.year[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Đánh giá tối thiểu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={[filters.rating]}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, rating: value[0] })
              }
              max={5}
              min={1}
              step={0.1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {filters.rating} sao trở lên
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
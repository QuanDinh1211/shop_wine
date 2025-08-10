"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface AccessoryFiltersProps {
  filters: {
    types: { id: number; name: string }[];
    brands: string[];
    colors: string[];
    materials: string[];
    priceRange: { min: number; max: number };
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export const AccessoryFilters: React.FC<AccessoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [localFilters, setLocalFilters] = useState({
    name: "",
    types: [] as number[],
    brands: [] as string[],
    colors: [] as string[],
    materials: [] as string[],
    priceRange: [filters.priceRange.min, filters.priceRange.max] as [
      number,
      number
    ],
    inStock: false,
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTypeChange = (typeId: number, checked: boolean) => {
    const newTypes = checked
      ? [...localFilters.types, typeId]
      : localFilters.types.filter((id) => id !== typeId);
    handleFilterChange("types", newTypes);
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...localFilters.brands, brand]
      : localFilters.brands.filter((b) => b !== brand);
    handleFilterChange("brands", newBrands);
  };

  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked
      ? [...localFilters.colors, color]
      : localFilters.colors.filter((c) => c !== color);
    handleFilterChange("colors", newColors);
  };

  const handleMaterialChange = (material: string, checked: boolean) => {
    const newMaterials = checked
      ? [...localFilters.materials, material]
      : localFilters.materials.filter((m) => m !== material);
    handleFilterChange("materials", newMaterials);
  };

  const handlePriceRangeChange = (value: number[]) => {
    handleFilterChange("priceRange", value);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      name: "",
      types: [],
      brands: [],
      colors: [],
      materials: [],
      priceRange: [filters.priceRange.min, filters.priceRange.max] as [
        number,
        number
      ],
      inStock: false,
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = () => {
    return (
      localFilters.name ||
      localFilters.types.length > 0 ||
      localFilters.brands.length > 0 ||
      localFilters.colors.length > 0 ||
      localFilters.materials.length > 0 ||
      localFilters.inStock ||
      localFilters.priceRange[0] !== filters.priceRange.min ||
      localFilters.priceRange[1] !== filters.priceRange.max
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tìm kiếm theo tên */}
        <div className="space-y-2">
          <Label htmlFor="name">Tìm kiếm</Label>
          <Input
            id="name"
            placeholder="Nhập tên phụ kiện..."
            value={localFilters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />
        </div>

        <Separator />

        {/* Loại phụ kiện */}
        <div className="space-y-3">
          <Label>Loại phụ kiện</Label>
          <div className="space-y-2">
            {filters.types.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.id}`}
                  checked={localFilters.types.includes(type.id)}
                  onCheckedChange={(checked) =>
                    handleTypeChange(type.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`type-${type.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {type.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Hãng */}
        {filters.brands.length > 0 && (
          <>
            <div className="space-y-3">
              <Label>Hãng</Label>
              <div className="space-y-2">
                {filters.brands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={localFilters.brands.includes(brand)}
                      onCheckedChange={(checked) =>
                        handleBrandChange(brand, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`brand-${brand}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Màu sắc */}
        {filters.colors.length > 0 && (
          <>
            <div className="space-y-3">
              <Label>Màu sắc</Label>
              <div className="space-y-2">
                {filters.colors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={localFilters.colors.includes(color)}
                      onCheckedChange={(checked) =>
                        handleColorChange(color, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`color-${color}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {color}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Chất liệu */}
        {filters.materials.length > 0 && (
          <>
            <div className="space-y-3">
              <Label>Chất liệu</Label>
              <div className="space-y-2">
                {filters.materials.map((material) => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox
                      id={`material-${material}`}
                      checked={localFilters.materials.includes(material)}
                      onCheckedChange={(checked) =>
                        handleMaterialChange(material, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`material-${material}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {material}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Khoảng giá */}
        <div className="space-y-3">
          <Label>Khoảng giá</Label>
          <div className="px-2">
            <Slider
              value={localFilters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={filters.priceRange.max}
              min={filters.priceRange.min}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{localFilters.priceRange[0].toLocaleString()}đ</span>
              <span>{localFilters.priceRange[1].toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Chỉ hiển thị còn hàng */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={localFilters.inStock}
            onCheckedChange={(checked) =>
              handleFilterChange("inStock", checked as boolean)
            }
          />
          <Label
            htmlFor="inStock"
            className="text-sm font-normal cursor-pointer"
          >
            Chỉ hiển thị còn hàng
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

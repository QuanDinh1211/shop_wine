import { useState, useEffect } from "react";
import { FilterOptions } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { getTypeName } from "@/lib/utils";

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
  const [types, setTypes] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  // Lấy danh sách type và country từ API
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [typesRes, countriesRes] = await Promise.all([
          fetch("/api/filters/types"),
          fetch("/api/filters/countries"),
        ]);
        const typesData = await typesRes.json();
        const countriesData = await countriesRes.json();
        setTypes(typesData);
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    }
    fetchFilterOptions();
  }, []);

  const handleTypeChange = (type: string) => {
    const newTypes = filters.type.includes(type)
      ? filters.type.filter((t) => t !== type)
      : [...filters.type, type];
    onFiltersChange({ ...filters, type: newTypes });
  };

  const handleCountryChange = (country: string) => {
    const newCountries = filters.country.includes(country)
      ? filters.country.filter((c) => c !== country)
      : [...filters.country, country];
    onFiltersChange({ ...filters, country: newCountries });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleYearRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, year: [value[0], value[1]] });
  };

  const handleRatingChange = (value: number) => {
    onFiltersChange({ ...filters, rating: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Loại rượu
        </h3>
        <div className="space-y-2">
          {types.map((type) => (
            <div key={type} className="flex items-center">
              <Checkbox
                id={`type-${type}`}
                checked={filters.type.includes(type)}
                onCheckedChange={() => handleTypeChange(type)}
              />
              <Label
                htmlFor={`type-${type}`}
                className="ml-2 text-gray-700 dark:text-gray-300"
              >
                {getTypeName(type)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Quốc gia
        </h3>
        <div className="space-y-2">
          {countries.map((country) => (
            <div key={country} className="flex items-center">
              <Checkbox
                id={`country-${country}`}
                checked={filters.country.includes(country)}
                onCheckedChange={() => handleCountryChange(country)}
              />
              <Label
                htmlFor={`country-${country}`}
                className="ml-2 text-gray-700 dark:text-gray-300"
              >
                {country}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Khoảng giá
        </h3>
        <Slider
          value={filters.priceRange}
          onValueChange={handlePriceRangeChange}
          min={500000}
          max={10000000}
          step={100000}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{filters.priceRange[0].toLocaleString("vi-VN")} ₫</span>
          <span>{filters.priceRange[1].toLocaleString("vi-VN")} ₫</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Năm sản xuất
        </h3>
        <Slider
          value={filters.year}
          onValueChange={handleYearRangeChange}
          min={2010}
          max={2024}
          step={1}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{filters.year[0]}</span>
          <span>{filters.year[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Đánh giá
        </h3>
        <Slider
          value={[filters.rating]}
          onValueChange={(value) => handleRatingChange(value[0])}
          min={1}
          max={5}
          step={0.1}
          className="mb-2"
        />
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filters.rating.toFixed(1)} sao trở lên
        </div>
      </div>

      <Button variant="outline" onClick={onClearFilters} className="w-full">
        Xóa bộ lọc
      </Button>
    </div>
  );
}

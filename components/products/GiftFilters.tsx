"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export interface GiftFilterOptions {
  giftTypes: string[]; // set, single, combo
  themes: string[]; // unique themes
  priceRange: { min: number; max: number };
}

interface GiftFiltersProps {
  options: GiftFilterOptions;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  externalFilters?: Partial<{
    giftTypes: string[];
    includeWine: boolean;
    theme: string | null;
    priceRange: [number, number];
  }>;
}

export const GiftFilters: React.FC<GiftFiltersProps> = ({
  options,
  onFiltersChange,
  onClearFilters,
  externalFilters,
}) => {
  const [localFilters, setLocalFilters] = useState({
    giftTypes: [] as string[],
    includeWine: undefined as boolean | undefined,
    theme: null as string | null,
    priceRange: [options.priceRange.min, options.priceRange.max] as [
      number,
      number
    ],
  });

  // Initialize from external once
  const initializedRef = React.useRef(false);
  useEffect(() => {
    if (!externalFilters || initializedRef.current) return;
    setLocalFilters((prev) => ({
      giftTypes: externalFilters.giftTypes ?? prev.giftTypes,
      includeWine: externalFilters.includeWine ?? prev.includeWine,
      theme: externalFilters.theme ?? prev.theme,
      priceRange: externalFilters.priceRange || prev.priceRange,
    }));
    initializedRef.current = true;
  }, [externalFilters]);

  const handleChange = (patch: Partial<typeof localFilters>) => {
    const next = { ...localFilters, ...patch };
    setLocalFilters(next);
    onFiltersChange(next);
  };

  const handleGiftTypeChange = (key: string, checked: boolean) => {
    const nextTypes = checked
      ? [...localFilters.giftTypes, key]
      : localFilters.giftTypes.filter((t) => t !== key);
    handleChange({ giftTypes: nextTypes });
  };

  const handleThemeChange = (theme: string | null) => {
    handleChange({ theme });
  };

  const clearAll = () => {
    const cleared = {
      giftTypes: [],
      includeWine: undefined as boolean | undefined,
      theme: null as string | null,
      priceRange: [options.priceRange.min, options.priceRange.max] as [
        number,
        number
      ],
    };
    setLocalFilters(cleared);
    onClearFilters();
  };

  const hasActive = () =>
    localFilters.giftTypes.length > 0 ||
    localFilters.includeWine === true ||
    !!localFilters.theme ||
    localFilters.priceRange[0] !== options.priceRange.min ||
    localFilters.priceRange[1] !== options.priceRange.max;

  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Bộ lọc</CardTitle>
          {hasActive() && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Xóa
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loại quà */}
        <div className="space-y-3">
          <Label>Loại quà</Label>
          <div className="space-y-2">
            {options.giftTypes.map((t) => (
              <div key={t} className="flex items-center space-x-2">
                <Checkbox
                  id={`giftType-${t}`}
                  checked={localFilters.giftTypes.includes(t)}
                  onCheckedChange={(checked) =>
                    handleGiftTypeChange(t, Boolean(checked))
                  }
                />
                <Label
                  htmlFor={`giftType-${t}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {t === "set"
                    ? "Set quà"
                    : t === "single"
                    ? "1 chai"
                    : "Combo"}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Kèm rượu */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeWine"
            checked={localFilters.includeWine === true}
            onCheckedChange={(checked) =>
              handleChange({ includeWine: checked ? true : undefined })
            }
          />
          <Label
            htmlFor="includeWine"
            className="text-sm font-normal cursor-pointer"
          >
            Có kèm rượu
          </Label>
        </div>

        <Separator />

        {/* Chủ đề */}
        {options.themes.length > 0 && (
          <div className="space-y-3">
            <Label>Chủ đề</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded border text-sm ${
                    !localFilters.theme ? "bg-gray-100 dark:bg-gray-800" : ""
                  }`}
                  onClick={() => handleThemeChange(null)}
                >
                  Tất cả
                </button>
                {options.themes.map((th) => (
                  <button
                    key={th}
                    type="button"
                    className={`px-3 py-1 rounded border text-sm ${
                      localFilters.theme === th
                        ? "bg-red-100 border-red-300"
                        : ""
                    }`}
                    onClick={() => handleThemeChange(th)}
                  >
                    {th}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Khoảng giá */}
        <div className="space-y-3">
          <Label>Khoảng giá</Label>
          <div className="px-2">
            <Slider
              value={localFilters.priceRange}
              onValueChange={(v) =>
                handleChange({ priceRange: v as [number, number] })
              }
              max={options.priceRange.max}
              min={options.priceRange.min}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{localFilters.priceRange[0].toLocaleString()}đ</span>
              <span>{localFilters.priceRange[1].toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={clearAll} className="w-full">
          Xóa bộ lọc
        </Button>
      </CardContent>
    </Card>
  );
};

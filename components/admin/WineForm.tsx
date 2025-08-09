"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Country, WineType, Grape, Pairing, Wine } from "@/lib/admin/types";

interface WineFormProps {
  wine?: Wine | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WineForm({ wine, onSuccess, onCancel }: WineFormProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    rating: "",
    reviews: "",
    year: "",
    country: "",
    type: "",
    region: "",
    alcohol: "",
    volume: "",
    winery: "",
    servingTemp: "",
    inStock: true,
    featured: false,
    images: [""],
    grapes: [],
    pairings: [],
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [wineTypes, setWineTypes] = useState<WineType[]>([]);
  const [grapes, setGrapes] = useState<Grape[]>([]);
  const [pairingList, setPairingList] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/countries").then((r) => r.json()),
      fetch("/api/admin/wine-types").then((r) => r.json()),
      fetch("/api/admin/grapes").then((r) => r.json()),
      fetch("/api/admin/pairings").then((r) => r.json()),
    ]).then(([countriesData, wineTypesData, grapesData, pairingsData]) => {
      setCountries(countriesData);
      setWineTypes(wineTypesData);
      setGrapes(grapesData);
      setPairingList(pairingsData);
    });
  }, []);

  useEffect(() => {
    if (wine && countries.length > 0) {
      setFormData({
        name: wine.name || "",
        description: wine.description || "",
        price: wine.price?.toString() || "",
        originalPrice: wine.originalPrice?.toString() || "",
        rating: wine.rating?.toString() || "",
        reviews: wine.reviews?.toString() || "",
        year: wine.year?.toString() || "",
        country: wine.country ? String(wine.country) : "",
        type: wine.type || "",
        region: wine.region || "",
        alcohol: wine.alcohol?.toString() || "",
        volume: wine.volume || "",
        winery: wine.winery || "",
        servingTemp: wine.servingTemp || "",
        inStock: wine.inStock ?? true,
        featured: wine.featured ?? false,
        images: wine.images.length ? wine.images : [""],
        grapes: wine.grapes || [],
        pairings: wine.pairings || [],
      });
    }
  }, [wine, countries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: parseFloat(formData.originalPrice),
      rating: parseFloat(formData.rating),
      reviews: parseInt(formData.reviews),
      year: parseInt(formData.year),
      alcohol: parseFloat(formData.alcohol),
      grapes: formData.grapes,
      pairings: formData.pairings,
      images: formData.images.filter((img: string) => img.trim() !== ""),
    };

    const url = wine ? `/api/admin/wines/${wine.id}` : "/api/admin/wines";
    const method = wine ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error("Lỗi khi lưu rượu:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const toggleCheckboxArray = (key: "grapes" | "pairings", value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v: string) => v !== value)
        : [...prev[key], value],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputGroup
            label="Tên rượu"
            value={formData.name}
            onChange={(v) => updateField("name", v)}
          />
          <InputGroup
            label="Mô tả"
            value={formData.description}
            onChange={(v) => updateField("description", v)}
            textarea
          />

          <InputGroup
            label="Giá bán"
            value={formData.price}
            onChange={(v) => updateField("price", v)}
            type="number"
          />
          <InputGroup
            label="Giá gốc"
            value={formData.originalPrice}
            onChange={(v) => updateField("originalPrice", v)}
            type="number"
          />
          <InputGroup
            label="Đánh giá (rating)"
            value={formData.rating}
            onChange={(v) => updateField("rating", v)}
            type="number"
          />
          <InputGroup
            label="Số lượt đánh giá"
            value={formData.reviews}
            onChange={(v) => updateField("reviews", v)}
            type="number"
          />

          <InputGroup
            label="Niên vụ (năm)"
            value={formData.year}
            onChange={(v) => updateField("year", v)}
            type="number"
          />
          <InputGroup
            label="Nồng độ cồn (%)"
            value={formData.alcohol}
            onChange={(v) => updateField("alcohol", v)}
            type="number"
          />
          <InputGroup
            label="Dung tích (ml)"
            value={formData.volume}
            onChange={(v) => updateField("volume", v)}
          />
          <InputGroup
            label="Vùng"
            value={formData.region}
            onChange={(v) => updateField("region", v)}
          />
          <InputGroup
            label="Hãng rượu"
            value={formData.winery}
            onChange={(v) => updateField("winery", v)}
          />
          <InputGroup
            label="Nhiệt độ phục vụ"
            value={formData.servingTemp}
            onChange={(v) => updateField("servingTemp", v)}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.inStock}
              onChange={(e) => updateField("inStock", e.target.checked)}
            />
            <Label>Còn hàng</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
            />
            <Label>Nổi bật</Label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Quốc gia</Label>
            <Select
              value={formData.country ?? ""}
              onValueChange={(v) => updateField("country", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn quốc gia" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Loại rượu</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => updateField("type", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại rượu" />
              </SelectTrigger>
              <SelectContent>
                {wineTypes.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Hình ảnh</Label>
            {formData.images.map((img: string, index: number) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={img}
                  onChange={(e) => {
                    const newImgs = [...formData.images];
                    newImgs[index] = e.target.value;
                    updateField("images", newImgs);
                  }}
                />
                {formData.images.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newImgs = [...formData.images];
                      newImgs.splice(index, 1);
                      updateField("images", newImgs);
                    }}
                  >
                    Xoá
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => updateField("images", [...formData.images, ""])}
              size="sm"
            >
              Thêm ảnh
            </Button>
          </div>

          <div>
            <Label>Loại nho</Label>
            <div className="grid grid-cols-2 gap-2">
              {grapes.map((g) => (
                <label key={g.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.grapes.includes(g.name)}
                    onChange={() => toggleCheckboxArray("grapes", g.name)}
                  />
                  {g.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Món ăn kèm</Label>
            <div className="grid grid-cols-2 gap-2">
              {pairingList.map((p) => (
                <label key={p.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.pairings.includes(p.name)}
                    onChange={() => toggleCheckboxArray("pairings", p.name)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : wine ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </form>
  );
}

function InputGroup({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {textarea ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

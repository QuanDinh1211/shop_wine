"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gift, GiftFormData } from "@/lib/admin/types";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

interface GiftFormProps {
  gift?: Gift | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function GiftForm({ gift, onSubmit, onCancel }: GiftFormProps) {
  const [formData, setFormData] = useState<GiftFormData>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    giftType: "set",
    includeWine: false,
    theme: "",
    packaging: "",
    images: [],
    items: [],
    inStock: true,
    featured: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gift) {
      setFormData({
        name: gift.name,
        description: gift.description || "",
        price: gift.price.toString(),
        originalPrice: gift.originalPrice?.toString() || "",
        giftType: gift.giftType,
        includeWine: gift.includeWine,
        theme: gift.theme || "",
        packaging: gift.packaging || "",
        images: gift.images,
        items: gift.items,
        inStock: gift.inStock,
        featured: gift.featured,
      });
    }
  }, [gift]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const giftData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
      };

      const url = gift ? `/api/admin/gifts/${gift.id}` : "/api/admin/gifts";
      const method = gift ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify(giftData),
      });

      if (response.ok) {
        toast.success(
          gift ? "Cập nhật quà tặng thành công" : "Thêm quà tặng thành công"
        );
        onSubmit();
      } else {
        const error = await response.json();
        toast.error(error.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi lưu quà tặng:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addItem = () => {
    const item = prompt("Nhập tên món hàng:");
    if (item) {
      setFormData({
        ...formData,
        items: [...formData.items, item],
      });
    }
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên quà tặng */}
        <div className="md:col-span-2">
          <Label htmlFor="name">Tên quà tặng *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên quà tặng"
            required
          />
        </div>

        {/* Mô tả */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Mô tả chi tiết về quà tặng"
            rows={3}
          />
        </div>

        {/* Giá */}
        <div>
          <Label htmlFor="price">Giá *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="0"
            required
          />
        </div>

        {/* Giá gốc */}
        <div>
          <Label htmlFor="originalPrice">Giá gốc</Label>
          <Input
            id="originalPrice"
            type="number"
            value={formData.originalPrice}
            onChange={(e) =>
              setFormData({ ...formData, originalPrice: e.target.value })
            }
            placeholder="0"
          />
        </div>

        {/* Loại quà tặng */}
        <div>
          <Label htmlFor="giftType">Loại quà tặng *</Label>
          <Select
            value={formData.giftType}
            onValueChange={(value: "set" | "single" | "combo") =>
              setFormData({ ...formData, giftType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại quà tặng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="set">Set quà</SelectItem>
              <SelectItem value="single">1 chai</SelectItem>
              <SelectItem value="combo">Combo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chủ đề */}
        <div>
          <Label htmlFor="theme">Chủ đề</Label>
          <Input
            id="theme"
            value={formData.theme}
            onChange={(e) =>
              setFormData({ ...formData, theme: e.target.value })
            }
            placeholder="Tết, Noel, Sinh nhật..."
          />
        </div>

        {/* Bao bì */}
        <div>
          <Label htmlFor="packaging">Bao bì</Label>
          <Input
            id="packaging"
            value={formData.packaging}
            onChange={(e) =>
              setFormData({ ...formData, packaging: e.target.value })
            }
            placeholder="Hộp gỗ, túi vải..."
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeWine"
              checked={formData.includeWine}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, includeWine: checked as boolean })
              }
            />
            <Label htmlFor="includeWine">Kèm rượu</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, inStock: checked as boolean })
              }
            />
            <Label htmlFor="inStock">Còn hàng</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked as boolean })
              }
            />
            <Label htmlFor="featured">Nổi bật</Label>
          </div>
        </div>
      </div>

      {/* Hình ảnh */}
      <div>
        <Label>Hình ảnh</Label>
        <div className="space-y-2">
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input value={image} readOnly />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addImage}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm hình ảnh
          </Button>
        </div>
      </div>

      {/* Danh sách món hàng */}
      <div>
        <Label>Danh sách món hàng trong set</Label>
        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input value={item} readOnly />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm món hàng
          </Button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : gift ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </form>
  );
}

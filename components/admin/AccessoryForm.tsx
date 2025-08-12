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
import { Switch } from "@/components/ui/switch";
import { Accessory } from "@/lib/types";
import { toast } from "sonner";

interface AccessoryType {
  id: number;
  name: string;
  description?: string;
}

interface AccessoryFormProps {
  accessory?: Accessory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AccessoryForm({
  accessory,
  onSuccess,
  onCancel,
}: AccessoryFormProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    accessoryTypeId: "",
    description: "",
    price: "",
    originalPrice: "",
    brand: "",
    material: "",
    color: "",
    size: "",
    inStock: true,
    featured: false,
    images: [""],
  });

  const [accessoryTypes, setAccessoryTypes] = useState<AccessoryType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy danh sách loại phụ kiện
    fetch("/api/admin/accessory-types", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAccessoryTypes(data);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi tải loại phụ kiện:", error);
        toast.error("Không thể tải danh sách loại phụ kiện");
      });
  }, []);

  useEffect(() => {
    if (accessory && accessoryTypes.length > 0) {
      setFormData({
        name: accessory.name || "",
        accessoryTypeId: accessory.accessoryTypeId?.toString() || "",
        description: accessory.description || "",
        price: accessory.price?.toString() || "",
        originalPrice: accessory.originalPrice?.toString() || "",
        brand: accessory.brand || "",
        material: accessory.material || "",
        color: accessory.color || "",
        size: accessory.size || "",
        inStock: accessory.inStock ?? true,
        featured: accessory.featured ?? false,
        images: accessory.images.length ? accessory.images : [""],
      });
    }
  }, [accessory, accessoryTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice
        ? parseFloat(formData.originalPrice)
        : null,
      accessoryTypeId: parseInt(formData.accessoryTypeId),
      images: formData.images.filter((img: string) => img.trim() !== ""),
    };

    try {
      const url = accessory
        ? `/api/admin/accessories/${accessory.id}`
        : "/api/admin/accessories";

      const method = accessory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi lưu phụ kiện:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev: any) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev: any) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter(
        (_: any, i: number) => i !== index
      );
      setFormData((prev: any) => ({ ...prev, images: newImages }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên phụ kiện */}
        <div className="md:col-span-2">
          <Label htmlFor="name">Tên phụ kiện *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nhập tên phụ kiện"
            required
          />
        </div>

        {/* Loại phụ kiện */}
        <div>
          <Label htmlFor="accessoryTypeId">Loại phụ kiện *</Label>
          <Select
            value={formData.accessoryTypeId}
            onValueChange={(value) =>
              handleInputChange("accessoryTypeId", value)
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại phụ kiện" />
            </SelectTrigger>
            <SelectContent>
              {accessoryTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Giá */}
        <div>
          <Label htmlFor="price">Giá (VNĐ) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0"
            min="0"
            step="1000"
            required
          />
        </div>

        {/* Giá gốc */}
        <div>
          <Label htmlFor="originalPrice">Giá gốc (VNĐ)</Label>
          <Input
            id="originalPrice"
            type="number"
            value={formData.originalPrice}
            onChange={(e) => handleInputChange("originalPrice", e.target.value)}
            placeholder="0"
            min="0"
            step="1000"
          />
        </div>

        {/* Thương hiệu */}
        <div>
          <Label htmlFor="brand">Thương hiệu</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => handleInputChange("brand", e.target.value)}
            placeholder="Nhập thương hiệu"
          />
        </div>

        {/* Chất liệu */}
        <div>
          <Label htmlFor="material">Chất liệu</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => handleInputChange("material", e.target.value)}
            placeholder="Nhập chất liệu"
          />
        </div>

        {/* Màu sắc */}
        <div>
          <Label htmlFor="color">Màu sắc</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => handleInputChange("color", e.target.value)}
            placeholder="Nhập màu sắc"
          />
        </div>

        {/* Kích thước */}
        <div>
          <Label htmlFor="size">Kích thước</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e) => handleInputChange("size", e.target.value)}
            placeholder="Nhập kích thước"
          />
        </div>

        {/* Trạng thái tồn kho */}
        <div className="flex items-center space-x-2">
          <Switch
            id="inStock"
            checked={formData.inStock}
            onCheckedChange={(checked) => handleInputChange("inStock", checked)}
          />
          <Label htmlFor="inStock">Còn hàng</Label>
        </div>

        {/* Sản phẩm nổi bật */}
        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) =>
              handleInputChange("featured", checked)
            }
          />
          <Label htmlFor="featured">Sản phẩm nổi bật</Label>
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Nhập mô tả chi tiết về phụ kiện"
          rows={4}
        />
      </div>

      {/* Hình ảnh */}
      <div>
        <Label>Hình ảnh</Label>
        <div className="space-y-3">
          {formData.images.map((image: string, index: number) => (
            <div key={index} className="flex space-x-2">
              <Input
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="URL hình ảnh"
                type="url"
              />
              {formData.images.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeImageField(index)}
                >
                  Xóa
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageField}
          >
            Thêm hình ảnh
          </Button>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : accessory ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </form>
  );
}

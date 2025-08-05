import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTypeName = (type: string) => {
  switch (type) {
    case "red":
      return "Đỏ";
    case "white":
      return "Trắng";
    case "rose":
      return "Hồng";
    case "sparkling":
      return "Sủi bọt";
    default:
      return type;
  }
};

export function parseImages(input: any): string[] {
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Nếu không phải JSON hợp lệ thì tách bằng dấu phẩy
      return input.split(",").map((url: string) => url.trim());
    }
  }

  if (Array.isArray(input)) {
    return input;
  }

  return [];
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

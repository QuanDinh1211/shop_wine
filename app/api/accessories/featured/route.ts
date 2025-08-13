import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Accessory } from "@/lib/types";
import { config } from "@/config/db";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách phụ kiện nổi bật
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "8");

    if (limit < 1) {
      return NextResponse.json(
        { error: "Tham số limit phải lớn hơn 0" },
        { status: 400 }
      );
    }

    const safeLimit = Math.floor(limit);

    connection = await getConnection();

    const query = `
      SELECT 
        a.id,
        a.name,
        a.accessory_type_id as accessoryTypeId,
        at.name as accessoryType,
        a.price,
        a.original_price as originalPrice,
        a.description,
        a.images,
        a.in_stock as inStock,
        a.featured,
        a.brand,
        a.material,
        a.color,
        a.size
      FROM Accessories a
      LEFT JOIN AccessoryTypes at ON a.accessory_type_id = at.accessory_type_id
      WHERE a.featured = 1 AND a.in_stock = 1
      ORDER BY a.name ASC
      LIMIT ${safeLimit}
    `;

    const [rows] = await connection.execute(query);

    const accessories: Accessory[] = (rows as any[]).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      accessoryTypeId: Number(row.accessoryTypeId),
      accessoryType: String(row.accessoryType),
      price: parseFloat(row.price),
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
      description: row.description ? String(row.description) : null,
      images: parseImages(row.images),
      inStock: Boolean(row.inStock),
      featured: Boolean(row.featured),
      brand: row.brand ? String(row.brand) : null,
      material: row.material ? String(row.material) : null,
      color: row.color ? String(row.color) : null,
      size: row.size ? String(row.size) : null,
    }));

    return NextResponse.json(accessories);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phụ kiện nổi bật:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể lấy danh sách phụ kiện nổi bật.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy các tùy chọn lọc cho phụ kiện
export async function GET() {
  let connection;
  try {
    connection = await getConnection();

    // Lấy danh sách loại phụ kiện
    const typeQuery = `
      SELECT DISTINCT 
        at.accessory_type_id as id,
        at.name
      FROM AccessoryTypes at
      INNER JOIN Accessories a ON at.accessory_type_id = a.accessory_type_id
      WHERE a.in_stock = 1
      ORDER BY at.name
    `;

    // Lấy danh sách hãng
    const brandQuery = `
      SELECT DISTINCT brand as name
      FROM Accessories 
      WHERE brand IS NOT NULL AND brand != '' AND in_stock = 1
      ORDER BY brand
    `;

    // Lấy danh sách màu
    const colorQuery = `
      SELECT DISTINCT color as name
      FROM Accessories 
      WHERE color IS NOT NULL AND color != '' AND in_stock = 1
      ORDER BY color
    `;

    // Lấy danh sách chất liệu
    const materialQuery = `
      SELECT DISTINCT material as name
      FROM Accessories 
      WHERE material IS NOT NULL AND material != '' AND in_stock = 1
      ORDER BY material
    `;

    // Lấy khoảng giá
    const priceQuery = `
      SELECT 
        MIN(price) as minPrice,
        MAX(price) as maxPrice
      FROM Accessories 
      WHERE in_stock = 1
    `;

    const [typeRows] = await connection.execute(typeQuery);
    const [brandRows] = await connection.execute(brandQuery);
    const [colorRows] = await connection.execute(colorQuery);
    const [materialRows] = await connection.execute(materialQuery);
    const [priceRows] = await connection.execute(priceQuery);

    const filters = {
      types: (typeRows as any[]).map((row) => ({
        id: Number(row.id),
        name: String(row.name),
      })),
      brands: (brandRows as any[]).map((row) => String(row.name)),
      colors: (colorRows as any[]).map((row) => String(row.name)),
      materials: (materialRows as any[]).map((row) => String(row.name)),
      priceRange: {
        min: (priceRows as any[])[0]?.minPrice ? parseFloat((priceRows as any[])[0].minPrice) : 0,
        max: (priceRows as any[])[0]?.maxPrice ? parseFloat((priceRows as any[])[0].maxPrice) : 0,
      },
    };

    return NextResponse.json(filters);
  } catch (error) {
    console.error("Lỗi khi lấy tùy chọn lọc phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể lấy tùy chọn lọc phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

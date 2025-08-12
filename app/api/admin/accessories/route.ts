import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { parseImages } from "@/lib/utils";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách phụ kiện với phân trang và tìm kiếm
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const decoded = token && verifyAdminToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: "Bạn không có quyền truy cập" },
      { status: 403 }
    );
  }
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "";
    const brand = searchParams.get("brand") || "";
    const color = searchParams.get("color") || "";
    const priceMin = searchParams.get("priceMin") || "";
    const priceMax = searchParams.get("priceMax") || "";
    const inStock = searchParams.get("inStock") || "";
    const name = searchParams.get("name") || "";

    const offset = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Tham số page và limit phải lớn hơn 0" },
        { status: 400 }
      );
    }

    const safeLimit = Math.floor(limit);
    const safeOffset = Math.floor(offset);

    connection = await getConnection();

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    if (name) {
      whereConditions.push("a.name LIKE ?");
      queryParams.push(`%${name}%`);
    }

    if (type) {
      whereConditions.push("at.name LIKE ?");
      queryParams.push(`%${type}%`);
    }

    if (brand) {
      whereConditions.push("a.brand LIKE ?");
      queryParams.push(`%${brand}%`);
    }

    if (color) {
      whereConditions.push("a.color LIKE ?");
      queryParams.push(`%${color}%`);
    }

    if (priceMin) {
      const priceMinNum = parseFloat(priceMin);
      if (!isNaN(priceMinNum)) {
        whereConditions.push("a.price >= ?");
        queryParams.push(priceMinNum);
      }
    }

    if (priceMax) {
      const priceMaxNum = parseFloat(priceMax);
      if (!isNaN(priceMaxNum)) {
        whereConditions.push("a.price <= ?");
        queryParams.push(priceMaxNum);
      }
    }

    if (inStock === "true" || inStock === "false") {
      whereConditions.push("a.in_stock = ?");
      queryParams.push(inStock === "true" ? 1 : 0);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const countQuery = `
      SELECT COUNT(DISTINCT a.id) as total 
      FROM Accessories a
      LEFT JOIN AccessoryTypes at ON a.accessory_type_id = at.accessory_type_id
      ${whereClause}
    `;

    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = (countResult as any)[0].total;

    const query = `
      SELECT 
        a.id,
        a.name,
        a.accessory_type_id,
        at.name as accessory_type,
        a.price,
        a.original_price,
        a.description,
        a.images,
        a.in_stock,
        a.featured,
        a.brand,
        a.material,
        a.color,
        a.size
      FROM Accessories a
      LEFT JOIN AccessoryTypes at ON a.accessory_type_id = at.accessory_type_id
      ${whereClause}
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rows] = await connection.execute(query, [...queryParams]);

    const accessories = (rows as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      accessoryTypeId: row.accessory_type_id,
      accessoryType: row.accessory_type,
      price: row.price,
      originalPrice: row.original_price,
      description: row.description,
      images: parseImages(row.images),
      inStock: Boolean(row.in_stock),
      featured: Boolean(row.featured),
      brand: row.brand,
      material: row.material,
      color: row.color,
      size: row.size,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      accessories,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phụ kiện:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Thêm phụ kiện mới
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const decoded = token && verifyAdminToken(token);

  if (!decoded) {
    return NextResponse.json(
      { error: "Bạn không có quyền truy cập" },
      { status: 403 }
    );
  }
  let connection;
  try {
    const body = await request.json();
    const {
      name,
      accessoryTypeId,
      price,
      originalPrice,
      description,
      images,
      inStock,
      featured,
      brand,
      material,
      color,
      size,
    } = body;

    // Validate dữ liệu
    if (!name || !accessoryTypeId || !price) {
      return NextResponse.json(
        { error: "Tên, loại và giá là bắt buộc" },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Giá phải lớn hơn 0" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const id = `accessories_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    const query = `
      INSERT INTO Accessories (
        id, name, accessory_type_id, price, original_price, description,
        images, in_stock, featured, brand, material, color, size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(query, [
      id,
      name,
      accessoryTypeId,
      price,
      originalPrice || null,
      description || null,
      JSON.stringify(images || []),
      inStock ? 1 : 0,
      featured ? 1 : 0,
      brand || null,
      material || null,
      color || null,
      size || null,
    ]);

    const insertId = (result as any).insertId;

    return NextResponse.json({
      message: "Thêm phụ kiện thành công",
      id: insertId,
    });
  } catch (error) {
    console.error("Lỗi khi thêm phụ kiện:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

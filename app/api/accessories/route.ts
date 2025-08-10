import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Accessory } from "@/lib/types";
import { config } from "@/config/db";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách phụ kiện với phân trang và tìm kiếm
export async function GET(request: NextRequest) {
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
    const featured = searchParams.get("featured") || "";

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

    if (featured === "true") {
      whereConditions.push("a.featured = ?");
      queryParams.push(1);
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

    const [countRows] = await connection.execute(countQuery, queryParams);
    const total = (countRows as any[])[0].total;
    const totalPages = Math.ceil(total / safeLimit);

    const selectQuery = `
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
      ${whereClause}
      ORDER BY a.featured DESC, a.name ASC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rows] = await connection.execute(selectQuery, queryParams);

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

    return NextResponse.json({
      accessories,
      total,
      page,
      limit: safeLimit,
      totalPages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể lấy danh sách phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Thêm phụ kiện mới
export async function POST(request: NextRequest) {
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

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Tên phụ kiện không được để trống" },
        { status: 400 }
      );
    }

    if (!accessoryTypeId || isNaN(Number(accessoryTypeId))) {
      return NextResponse.json(
        { error: "Loại phụ kiện không hợp lệ" },
        { status: 400 }
      );
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json(
        { error: "Giá phụ kiện phải lớn hơn 0" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Kiểm tra xem loại phụ kiện có tồn tại không
    const checkTypeQuery = "SELECT accessory_type_id FROM AccessoryTypes WHERE accessory_type_id = ?";
    const [typeRows] = await connection.execute(checkTypeQuery, [accessoryTypeId]);
    
    if ((typeRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Loại phụ kiện không tồn tại" },
        { status: 400 }
      );
    }

    // Tạo ID ngẫu nhiên
    const id = `A${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

    const insertQuery = `
      INSERT INTO Accessories (
        id, name, accessory_type_id, price, original_price, description, 
        images, in_stock, featured, brand, material, color, size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      id,
      name.trim(),
      accessoryTypeId,
      price,
      originalPrice || null,
      description || null,
      images ? JSON.stringify(images) : null,
      inStock !== undefined ? (inStock ? 1 : 0) : 1,
      featured ? 1 : 0,
      brand || null,
      material || null,
      color || null,
      size || null,
    ];

    await connection.execute(insertQuery, insertParams);

    // Lấy thông tin loại phụ kiện để trả về
    const typeQuery = "SELECT name FROM AccessoryTypes WHERE accessory_type_id = ?";
    const [typeResult] = await connection.execute(typeQuery, [accessoryTypeId]);
    const accessoryTypeName = (typeResult as any[])[0].name;

    const newAccessory: Accessory = {
      id,
      name: name.trim(),
      accessoryTypeId: Number(accessoryTypeId),
      accessoryType: accessoryTypeName,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      description: description || null,
      images: images || [],
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      featured: Boolean(featured),
      brand: brand || null,
      material: material || null,
      color: color || null,
      size: size || null,
    };

    return NextResponse.json(newAccessory, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi thêm phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể thêm phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Gift } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách quà tặng với phân trang và tìm kiếm
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
    const giftType = searchParams.get("giftType") || "";
    const theme = searchParams.get("theme") || "";
    const includeWine = searchParams.get("includeWine") || "";
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
      whereConditions.push("g.name LIKE ?");
      queryParams.push(`%${name}%`);
    }

    if (giftType && giftType != "all") {
      whereConditions.push("g.gift_type = ?");
      queryParams.push(giftType);
    }

    if (theme) {
      whereConditions.push("g.theme LIKE ?");
      queryParams.push(`%${theme}%`);
    }

    if (includeWine === "true" || includeWine === "false") {
      whereConditions.push("g.include_wine = ?");
      queryParams.push(includeWine === "true" ? 1 : 0);
    }

    if (priceMin) {
      const priceMinNum = parseFloat(priceMin);
      if (!isNaN(priceMinNum)) {
        whereConditions.push("g.price >= ?");
        queryParams.push(priceMinNum);
      }
    }

    if (priceMax) {
      const priceMaxNum = parseFloat(priceMax);
      if (!isNaN(priceMaxNum)) {
        whereConditions.push("g.price <= ?");
        queryParams.push(priceMaxNum);
      }
    }

    if (inStock === "true" || inStock === "false") {
      whereConditions.push("g.in_stock = ?");
      queryParams.push(inStock === "true" ? 1 : 0);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM Gifts g 
      ${whereClause}
    `;

    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = (countResult as any)[0].total;

    const totalPages = Math.ceil(total / safeLimit);

    const giftsQuery = `
      SELECT 
        g.id,
        g.name,
        g.price,
        g.original_price,
        g.description,
        g.images,
        g.in_stock,
        g.featured,
        g.gift_type,
        g.include_wine,
        g.theme,
        g.packaging,
        g.items,
        g.created_at
      FROM Gifts g 
      ${whereClause}
      ORDER BY g.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [giftsResult] = await connection.execute(giftsQuery, [
      ...queryParams,
    ]);

    const gifts = (giftsResult as any[]).map((gift) => ({
      id: gift.id,
      name: gift.name,
      price: parseFloat(gift.price),
      originalPrice: gift.original_price
        ? parseFloat(gift.original_price)
        : null,
      description: gift.description,
      images: parseImages(gift.images),
      inStock: Boolean(gift.in_stock),
      featured: Boolean(gift.featured),
      giftType: gift.gift_type,
      includeWine: Boolean(gift.include_wine),
      theme: gift.theme,
      packaging: gift.packaging,
      items: parseImages(gift.items),
      createdAt: gift.created_at,
    }));

    return NextResponse.json({
      gifts,
      total,
      totalPages,
      currentPage: page,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách quà tặng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Thêm quà tặng mới
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
    const giftData: Gift = await request.json();

    // Validate dữ liệu
    if (!giftData.name || !giftData.price || !giftData.giftType) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const insertQuery = `
      INSERT INTO Gifts (
        id, name, price, original_price, description, images, 
        in_stock, featured, gift_type, include_wine, theme, 
        packaging, items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const giftId = `G${Date.now()}`;

    await connection.execute(insertQuery, [
      giftId,
      giftData.name,
      giftData.price,
      giftData.originalPrice || null,
      giftData.description || null,
      JSON.stringify(giftData.images || []),
      giftData.inStock ? 1 : 0,
      giftData.featured ? 1 : 0,
      giftData.giftType,
      giftData.includeWine ? 1 : 0,
      giftData.theme || null,
      giftData.packaging || null,
      JSON.stringify(giftData.items || []),
    ]);

    return NextResponse.json({
      message: "Thêm quà tặng thành công",
      giftId,
    });
  } catch (error: any) {
    console.error("Lỗi khi thêm quà tặng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

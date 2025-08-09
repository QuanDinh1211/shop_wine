import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Wine } from "@/lib/types";
import { config } from "@/config/db";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách rượu với phân trang và tìm kiếm
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "";
    const country = searchParams.get("country") || "";
    const year = searchParams.get("year") || "";
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
      whereConditions.push("w.name LIKE ?");
      queryParams.push(`%${name}%`);
    }

    if (type) {
      whereConditions.push("wt.name LIKE ?");
      queryParams.push(`%${type}%`);
    }
    if (country) {
      whereConditions.push("c.name LIKE ?");
      queryParams.push(`%${country}%`);
    }
    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        whereConditions.push("w.year = ?");
        queryParams.push(yearNum);
      }
    }
    if (priceMin) {
      const priceMinNum = parseFloat(priceMin);
      if (!isNaN(priceMinNum)) {
        whereConditions.push("w.price >= ?");
        queryParams.push(priceMinNum);
      }
    }
    if (priceMax) {
      const priceMaxNum = parseFloat(priceMax);
      if (!isNaN(priceMaxNum)) {
        whereConditions.push("w.price <= ?");
        queryParams.push(priceMaxNum);
      }
    }
    if (inStock === "true" || inStock === "false") {
      whereConditions.push("w.in_stock = ?");
      queryParams.push(inStock === "true" ? 1 : 0);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const countQuery = `
      SELECT COUNT(DISTINCT w.id) as total 
      FROM Wines w
      LEFT JOIN WineTypes wt ON w.wine_type_id = wt.wine_type_id
      LEFT JOIN Countries c ON w.country_id = c.country_id
      ${whereClause}
    `;

    const [countRows] = await connection.execute(countQuery, queryParams);
    const total = (countRows as any[])[0].total;
    const totalPages = Math.ceil(total / safeLimit);

    const selectQuery = `
  SELECT 
    w.id,
    w.name,
    wt.name AS type,
    w.wine_type_id AS wineTypeId,
    c.name AS country,
    w.region,
    w.country_id AS countryId,
    w.year,
    w.price,
    w.original_price AS originalPrice,
    w.rating,
    w.reviews,
    w.description,
    w.images,
    w.in_stock AS inStock,
    w.featured,
    w.alcohol,
    w.volume,
    w.winery,
    w.serving_temp AS servingTemp,
    GROUP_CONCAT(DISTINCT g.name) AS grapes,
    GROUP_CONCAT(DISTINCT p.name) AS pairings
  FROM Wines w
  LEFT JOIN WineTypes wt ON w.wine_type_id = wt.wine_type_id
  LEFT JOIN Countries c ON w.country_id = c.country_id
  LEFT JOIN WineGrapes wg ON w.id = wg.wine_id
  LEFT JOIN Grapes g ON wg.grape_id = g.grape_id
  LEFT JOIN WinePairings wp ON w.id = wp.wine_id
  LEFT JOIN Pairings p ON wp.pairing_id = p.pairing_id
  ${whereClause}
  GROUP BY w.id
  LIMIT ${safeLimit} OFFSET ${safeOffset}
`;

    const [rows] = await connection.execute(selectQuery, queryParams);

    const wines: Wine[] = (rows as any[]).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      wineTypeId: Number(row.wineTypeId),
      type: String(row.type),
      country: String(row.country),
      countryId: Number(row.countryId),
      region: row.region ? String(row.region) : null,
      year: row.year ? Number(row.year) : null,
      price: parseFloat(row.price),
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
      rating: row.rating ? parseFloat(row.rating) : null,
      reviews: Number(row.reviews),
      description: row.description ? String(row.description) : null,
      images: parseImages(row.images),
      inStock: Boolean(row.inStock),
      featured: Boolean(row.featured),
      alcohol: row.alcohol ? parseFloat(row.alcohol) : null,
      volume: row.volume ? Number(row.volume) : null,
      winery: row.winery ? String(row.winery) : null,
      servingTemp: row.servingTemp ? String(row.servingTemp) : null,
      grapes: row.grapes ? row.grapes.split(",") : [],
      pairings: row.pairings ? row.pairings.split(",") : [],
    }));

    return NextResponse.json({
      wines,
      total,
      page,
      limit: safeLimit,
      totalPages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách rượu:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể lấy danh sách rượu.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

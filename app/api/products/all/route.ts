import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy tất cả sản phẩm (rượu vang, phụ kiện, quà tặng) với phân trang và tìm kiếm
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "name-asc";
    const offset = parseInt(searchParams.get("offset") || "0");

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Tham số page và limit phải lớn hơn 0" },
        { status: 400 }
      );
    }

    const safeLimit = Math.floor(limit);
    const safeOffset = Math.floor(offset);

    connection = await getConnection();

    // Xây dựng query cho từng loại sản phẩm
    const wineQuery = `
       SELECT 
         w.id,
         w.name,
         w.price,
         w.original_price as originalPrice,
         w.description,
         w.rating,
         w.images,
         w.in_stock as inStock,
         w.featured,
         'wine' as category,
         wt.name as type,
         c.name as country,
         w.year,
         w.region,
         w.alcohol,
         w.volume,
         w.winery,
         NULL as grapes
       FROM Wines w
       LEFT JOIN WineTypes wt ON w.wine_type_id = wt.wine_type_id
       LEFT JOIN Countries c ON w.country_id = c.country_id
     `;

    const accessoryQuery = `
       SELECT 
         a.id,
         a.name,
         a.price,
         a.original_price as originalPrice,
         a.description,
         NULL as rating,
         a.images,
         a.in_stock as inStock,
         a.featured,
         'accessory' as category,
         at.name as type,
         NULL as country,
         NULL as year,
         NULL as region,
         NULL as alcohol,
         NULL as volume,
         a.brand,
         NULL as grapes
       FROM Accessories a
       LEFT JOIN AccessoryTypes at ON a.accessory_type_id = at.accessory_type_id
     `;

    const giftQuery = `
       SELECT 
         g.id,
         g.name,
         g.price,
         g.original_price as originalPrice,
         g.description,
         NULL as rating,
         g.images,
         g.in_stock as inStock,
         g.featured,
         'gift' as category,
         g.gift_type as type,
         NULL as country,
         NULL as year,
         NULL as region,
         NULL as alcohol,
         NULL as volume,
         NULL as brand,
         NULL as grapes
       FROM Gifts g
     `;

    // Xây dựng điều kiện WHERE
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    if (search) {
      whereConditions.push("name LIKE ?");
      queryParams.push(`%${search}%`);
    }

    if (category && category !== "all") {
      whereConditions.push("category = ?");
      queryParams.push(category);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Query tổng hợp
    const unionQuery = `
      ${wineQuery} ${whereClause}
      UNION ALL
      ${accessoryQuery} ${whereClause}
      UNION ALL
      ${giftQuery} ${whereClause}
    `;

    // Đếm tổng số sản phẩm
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        ${unionQuery}
      ) as combined_products
    `;

    const [countRows] = await connection.execute(countQuery, queryParams);
    const total = (countRows as any[])[0].total;

    // Query chính với sắp xếp và phân trang
    let orderClause = "";
    switch (sortBy) {
      case "name-asc":
        orderClause = "ORDER BY name ASC";
        break;
      case "name-desc":
        orderClause = "ORDER BY name DESC";
        break;
      case "price-asc":
        orderClause = "ORDER BY price ASC";
        break;
      case "price-desc":
        orderClause = "ORDER BY price DESC";
        break;
      case "rating-desc":
        orderClause = "ORDER BY rating DESC NULLS LAST";
        break;
      case "newest":
        orderClause = "ORDER BY featured DESC, name ASC";
        break;
      default:
        orderClause = "ORDER BY name ASC";
    }

    const selectQuery = `
      SELECT * FROM (
        ${unionQuery}
      ) as combined_products
      ${orderClause}
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rows] = await connection.execute(selectQuery, queryParams);

    // Chuyển đổi dữ liệu
    const products = (rows as any[]).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      price: parseFloat(row.price),
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
      description: row.description ? String(row.description) : null,
      rating: row.rating ? parseFloat(row.rating) : null,
      images: parseImages(row.images),
      inStock: Boolean(row.inStock),
      featured: Boolean(row.featured),
      category: String(row.category),
      type: row.type ? String(row.type) : null,
      country: row.country ? String(row.country) : null,
      year: row.year ? Number(row.year) : null,
      region: row.region ? String(row.region) : null,
      alcohol: row.alcohol ? parseFloat(row.alcohol) : null,
      volume: row.volume ? Number(row.volume) : null,
      brand: row.brand ? String(row.brand) : null,
      grapes: [], // Sẽ được cập nhật sau
    }));

    // Lấy grapes cho rượu vang
    const wineIds = products
      .filter((p) => p.category === "wine")
      .map((p) => p.id);

    if (wineIds.length > 0) {
      const grapesQuery = `
         SELECT 
           wg.wine_id,
           GROUP_CONCAT(DISTINCT g.name) AS grapes
         FROM WineGrapes wg
         LEFT JOIN Grapes g ON wg.grape_id = g.grape_id
         WHERE wg.wine_id IN (${wineIds.map(() => "?").join(",")})
         GROUP BY wg.wine_id
       `;

      const [grapesRows] = await connection.execute(grapesQuery, wineIds);
      const grapesMap = new Map();

      (grapesRows as any[]).forEach((row) => {
        grapesMap.set(
          String(row.wine_id),
          row.grapes ? row.grapes.split(",") : []
        );
      });

      // Cập nhật grapes cho từng sản phẩm rượu vang
      products.forEach((product) => {
        if (product.category === "wine") {
          product.grapes = grapesMap.get(product.id) || [];
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        limit: safeLimit,
        offset: safeOffset,
        hasMore: safeOffset + safeLimit < total,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể lấy danh sách sản phẩm.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

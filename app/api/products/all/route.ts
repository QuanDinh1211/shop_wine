import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { parseImages } from "@/lib/utils";

async function getConnection() {
  return mysql.createConnection(config);
}

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

    let params: any[] = [];

    // WHERE cho từng bảng (chỉ filter search ở trong query con)
    let wineWhere = "";
    let accessoryWhere = "";
    let giftWhere = "";

    // if (search) {
    //   wineWhere += "WHERE w.name LIKE ?";
    //   accessoryWhere += "WHERE a.name LIKE ?";
    //   giftWhere += "WHERE g.name LIKE ?";
    //   params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    // }

    const wineQuery = `
      SELECT 
        w.id,
        w.name,
        w.price,
        w.original_price AS originalPrice,
        w.description,
        w.rating,
        w.images,
        w.in_stock AS inStock,
        w.featured,
        'wine' AS category,
        wt.name AS type,
        c.name AS country,
        w.year,
        w.region,
        w.alcohol,
        w.volume,
        w.winery,
        NULL AS grapes,
        NULL AS brand
      FROM Wines w
      LEFT JOIN WineTypes wt ON w.wine_type_id = wt.wine_type_id
      LEFT JOIN Countries c ON w.country_id = c.country_id
      ${wineWhere}
    `;

    const accessoryQuery = `
      SELECT 
        a.id,
        a.name,
        a.price,
        a.original_price AS originalPrice,
        a.description,
        NULL AS rating,
        a.images,
        a.in_stock AS inStock,
        a.featured,
        'accessory' AS category,
        at.name AS type,
        NULL AS country,
        NULL AS year,
        NULL AS region,
        NULL AS alcohol,
        NULL AS volume,
        NULL AS winery,
        NULL AS grapes,
        a.brand
      FROM Accessories a
      LEFT JOIN AccessoryTypes at ON a.accessory_type_id = at.accessory_type_id
      ${accessoryWhere}
    `;

    const giftQuery = `
      SELECT 
        g.id,
        g.name,
        g.price,
        g.original_price AS originalPrice,
        g.description,
        NULL AS rating,
        g.images,
        g.in_stock AS inStock,
        g.featured,
        'gift' AS category,
        g.gift_type AS type,
        NULL AS country,
        NULL AS year,
        NULL AS region,
        NULL AS alcohol,
        NULL AS volume,
        NULL AS winery,
        NULL AS grapes,
        NULL AS brand
      FROM Gifts g
      ${giftWhere}
    `;

    // UNION ALL
    let unionQuery = `
      ${wineQuery}
      UNION ALL
      ${accessoryQuery}
      UNION ALL
      ${giftQuery}
    `;

    // Lọc category ở ngoài
    if (category && category !== "all") {
      unionQuery = `SELECT * FROM (${unionQuery}) AS combined WHERE category = ?`;
      params.push(category);
    } else {
      unionQuery = `SELECT * FROM (${unionQuery}) AS combined`;
    }

    // Đếm tổng số sản phẩm
    const countQuery = `
      SELECT COUNT(*) AS total FROM (${unionQuery}) AS total_products
    `;
    const [countRows] = await connection.execute(countQuery, params);
    const total = (countRows as any[])[0].total;

    // Sắp xếp
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
        orderClause = "ORDER BY rating DESC";
        break;
      case "newest":
        orderClause = "ORDER BY featured DESC, name ASC";
        break;
      default:
        orderClause = "ORDER BY name ASC";
    }

    // Query chính
    const selectQuery = `
      ${unionQuery}
      ${orderClause}
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;
    const [rows] = await connection.execute(selectQuery, params);

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
      winery: row.winery ? String(row.winery) : null,
      brand: row.brand ? String(row.brand) : null,
      grapes: [],
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
      products.forEach((product) => {
        if (product.category === "wine") {
          product.grapes = grapesMap.get(product.id) || [];
        }
      });
    }

    if (search) {
      const keyword = search.toLowerCase();
      products.sort((a, b) => {
        const aMatch = a.name.toLowerCase().includes(keyword);
        const bMatch = b.name.toLowerCase().includes(keyword);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
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

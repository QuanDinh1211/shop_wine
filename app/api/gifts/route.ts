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
    const limit = parseInt(searchParams.get("limit") || "12");
    const name = searchParams.get("name") || "";
    const giftType = searchParams.get("giftType") || ""; // set|single|combo
    const includeWine = searchParams.get("includeWine") || ""; // true|false
    const theme = searchParams.get("theme") || "";
    const packaging = searchParams.get("packaging") || "";
    const priceMin = searchParams.get("priceMin") || "";
    const priceMax = searchParams.get("priceMax") || "";
    const featured = searchParams.get("featured") || "";

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Tham số page và limit phải lớn hơn 0" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;
    const safeLimit = Math.floor(limit);
    const safeOffset = Math.floor(offset);

    connection = await getConnection();

    const where: string[] = [];
    const params: any[] = [];

    if (name) {
      where.push("g.name LIKE ?");
      params.push(`%${name}%`);
    }
    if (giftType) {
      const list = giftType
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (list.length === 1) {
        where.push("g.gift_type = ?");
        params.push(list[0]);
      } else if (list.length > 1) {
        where.push(`(${list.map(() => "g.gift_type = ?").join(" OR ")})`);
        list.forEach((t) => params.push(t));
      }
    }
    if (includeWine === "true" || includeWine === "false") {
      where.push("g.include_wine = ?");
      params.push(includeWine === "true" ? 1 : 0);
    }
    if (theme) {
      where.push("g.theme LIKE ?");
      params.push(`%${theme}%`);
    }
    if (packaging) {
      where.push("g.packaging LIKE ?");
      params.push(`%${packaging}%`);
    }
    if (priceMin) {
      const v = parseFloat(priceMin);
      if (!isNaN(v)) {
        where.push("g.price >= ?");
        params.push(v);
      }
    }
    if (priceMax) {
      const v = parseFloat(priceMax);
      if (!isNaN(v)) {
        where.push("g.price <= ?");
        params.push(v);
      }
    }
    if (featured === "true") {
      where.push("g.featured = 1");
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM Gifts g ${whereClause}`,
      params
    );
    const total = (countRows as any[])[0]?.total || 0;

    const [rows] = await connection.execute(
      `SELECT g.* FROM Gifts g ${whereClause} ORDER BY g.featured DESC, g.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    const gifts = (rows as any[]).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      price: parseFloat(r.price),
      originalPrice: r.original_price ? parseFloat(r.original_price) : null,
      description: r.description ? String(r.description) : null,
      images: parseImages(r.images),
      inStock: Boolean(r.in_stock),
      featured: Boolean(r.featured),
      giftType: String(r.gift_type),
      includeWine: Boolean(r.include_wine),
      theme: r.theme ? String(r.theme) : null,
      packaging: r.packaging ? String(r.packaging) : null,
      items: Array.isArray(r.items) ? r.items : parseImages(r.items),
    }));

    return NextResponse.json({ gifts, total, page, limit: safeLimit });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách quà tặng:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách quà tặng", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

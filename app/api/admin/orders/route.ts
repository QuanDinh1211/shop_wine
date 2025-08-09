import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Order, CartItem } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

async function getConnection() {
  return mysql.createConnection(config);
}

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const decoded = token && verifyAdminToken(token);

  if (!decoded) {
    return NextResponse.json(
      { error: "Bạn không có quyền truy cập" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  const orderCode = searchParams.get("orderCode")?.trim() || "";
  const customerName = searchParams.get("customerName")?.trim() || "";
  const status = searchParams.get("status")?.trim() || "";

  if (page < 1 || limit < 1 || isNaN(page) || isNaN(limit)) {
    return NextResponse.json(
      { error: "Tham số page và limit không hợp lệ" },
      { status: 400 }
    );
  }

  // Đảm bảo limit và offset là số nguyên
  const safeLimit = Math.floor(limit);
  const safeOffset = Math.floor(offset);

  let connection;

  try {
    connection = await getConnection();

    const where: string[] = [];
    const params: any[] = [];

    if (orderCode) {
      where.push("o.order_code LIKE ?");
      params.push(`%${orderCode}%`);
    }

    if (customerName) {
      where.push("(o.full_name LIKE ? OR c.name LIKE ?)");
      params.push(`%${customerName}%`, `%${customerName}%`);
    }

    if (status && status != "all") {
      where.push("o.status = ?");
      params.push(status);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Đếm tổng số đơn hàng
    const [countRows] = await connection.execute(
      `SELECT COUNT(DISTINCT o.order_id) as total
       FROM Orders o
       LEFT JOIN Customers c ON o.customer_id = c.id
       ${whereClause}`,
      params
    );
    const total = (countRows as any[])[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Lấy danh sách đơn hàng
    const [orderRows] = await connection.execute(
      `SELECT 
        o.order_id AS id,
        o.order_code,
        o.customer_id AS userId,
        o.full_name AS name,
        o.email,
        o.phone,
        o.total_amount AS total,
        o.status,
        o.order_date AS createdAt,
        o.shipping_address AS address,
        o.payment_method AS paymentMethod,
        o.notes,
        c.name AS customerName
       FROM Orders o
       LEFT JOIN Customers c ON o.customer_id = c.id
       ${whereClause}
       ORDER BY o.order_date DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}
       `,
      [...params]
    );

    const orderIds = (orderRows as any[]).map((row) => row.id);
    let items: (CartItem & { order_id: string })[] = [];

    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => "?").join(", ");
      const [itemRows] = await connection.execute(
        `SELECT order_id, wine_id, quantity, unit_price AS unitPrice
         FROM OrderItems
         WHERE order_id IN (${placeholders})`,
        orderIds
      );

      const wineIds = (itemRows as any[]).map((i) => i.wine_id);
      let wineDetails: any[] = [];

      if (wineIds.length > 0) {
        const winePlaceholders = wineIds.map(() => "?").join(", ");
        const [wineRows] = await connection.execute(
          `SELECT 
             w.id, w.name, wt.name AS type, w.wine_type_id AS wineTypeId,
             c.name AS country, w.country_id AS countryId, w.region, w.year,
             w.price, w.original_price AS originalPrice, w.rating, w.reviews,
             w.description, w.images, w.in_stock AS inStock, w.featured,
             w.alcohol, w.volume, w.winery, w.serving_temp AS servingTemp,
             GROUP_CONCAT(DISTINCT g.name) AS grapes,
             GROUP_CONCAT(DISTINCT p.name) AS pairings
           FROM Wines w
           LEFT JOIN WineTypes wt ON w.wine_type_id = wt.wine_type_id
           LEFT JOIN Countries c ON w.country_id = c.country_id
           LEFT JOIN WineGrapes wg ON w.id = wg.wine_id
           LEFT JOIN Grapes g ON wg.grape_id = g.grape_id
           LEFT JOIN WinePairings wp ON w.id = wp.wine_id
           LEFT JOIN Pairings p ON wp.pairing_id = p.pairing_id
           WHERE w.id IN (${winePlaceholders})
           GROUP BY w.id`,
          wineIds
        );
        wineDetails = wineRows as any[];
      }

      items = (itemRows as any[])
        .map((item) => {
          const wine = wineDetails.find((w) => w.id === item.wine_id);
          if (!wine) return null;
          return {
            order_id: String(item.order_id),
            wine: {
              id: String(wine.id),
              name: wine.name,
              type: wine.type,
              wineTypeId: wine.wineTypeId,
              country: wine.country,
              countryId: wine.countryId,
              region: wine.region,
              year: wine.year,
              price: wine.price,
              originalPrice: wine.originalPrice,
              rating: wine.rating,
              reviews: wine.reviews,
              description: wine.description,
              images: parseImages(wine.images),
              inStock: Boolean(wine.inStock),
              featured: Boolean(wine.featured),
              alcohol: wine.alcohol,
              volume: wine.volume,
              winery: wine.winery,
              servingTemp: wine.servingTemp,
              grapes: wine.grapes?.split(",") || [],
              pairings: wine.pairings?.split(",") || [],
            },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          };
        })
        .filter((i): i is CartItem & { order_id: string } => i !== null);
    }

    const orders: Order[] = (orderRows as any[]).map((row) => ({
      id: String(row.id),
      orderCode: row.order_code,
      userId: String(row.userId),
      items: items
        .filter((i) => i.order_id === String(row.id))
        .map(({ order_id, ...rest }) => rest),
      total: Number(row.total),
      status: row.status,
      createdAt: new Date(row.createdAt).toISOString(),
      shippingAddress: {
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.address?.split(",").pop()?.trim() || "",
      },
      paymentMethod: row.paymentMethod,
      notes: row.notes || null,
    }));

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    return NextResponse.json(
      { error: "Không thể lấy đơn hàng", details: (error as any).message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

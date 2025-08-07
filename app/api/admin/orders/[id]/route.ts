import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { CartItem, Order, Wine } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy chi tiết đơn hàng theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    connection = await getConnection();
    const [orderRows] = await connection.execute(
      `
      SELECT 
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
      WHERE o.order_id = ?
      `,
      [params.id]
    );

    const row = (orderRows as any[])[0];
    if (!row) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Lấy danh sách OrderItems
    const [itemRows] = await connection.execute(
      `
      SELECT 
        oi.order_id,
        oi.wine_id,
        oi.quantity,
        oi.unit_price AS unitPrice
      FROM OrderItems oi
      WHERE oi.order_id = ?
      `,
      [params.id]
    );

    // Lấy thông tin rượu
    const wineIds = (itemRows as any[]).map((item) => item.wine_id);
    let items: CartItem[] = [];
    if (wineIds.length > 0) {
      const [wineRows] = await connection.execute(
        `
        SELECT 
          w.id,
          w.name,
          wt.name AS type,
          w.wine_type_id AS wineTypeId,
          c.name AS country,
          w.country_id AS countryId,
          w.region,
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
        WHERE w.id IN (${wineIds.map(() => "?").join(", ")})
        GROUP BY w.id
        `,
        wineIds
      );

      const wineDetails = wineRows as any[];
      items = (itemRows as any[])
        .map((item) => {
          const wine = wineDetails.find((w) => w.id === item.wine_id);
          if (!wine) return null; // Bỏ qua nếu không tìm thấy rượu
          return {
            wine: {
              id: String(wine.id),
              name: String(wine.name),
              type: String(wine.type),
              wineTypeId: Number(wine.wineTypeId),
              country: String(wine.country),
              countryId: Number(wine.countryId),
              region: wine.region ? String(wine.region) : null,
              year: wine.year ? Number(wine.year) : null,
              price: Number(wine.price),
              originalPrice: wine.originalPrice
                ? Number(wine.originalPrice)
                : null,
              rating: wine.rating ? Number(wine.rating) : null,
              reviews: Number(wine.reviews),
              description: wine.description ? String(wine.description) : null,
              images: parseImages(wine.images),
              inStock: Boolean(wine.inStock),
              featured: Boolean(wine.featured),
              alcohol: wine.alcohol ? Number(wine.alcohol) : null,
              volume: wine.volume ? Number(wine.volume) : null,
              winery: wine.winery ? String(wine.winery) : null,
              servingTemp: wine.servingTemp ? String(wine.servingTemp) : null,
              grapes: wine.grapes ? wine.grapes.split(",") : [],
              pairings: wine.pairings ? wine.pairings.split(",") : [],
            },
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          };
        })
        .filter((item): item is CartItem => item !== null);
    }

    const order: Order = {
      id: String(row.id),
      orderCode: String(row.order_code),
      userId: String(row.userId),
      items,
      total: Number(row.total),
      status: row.status as
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled",
      createdAt: row.createdAt.toISOString(),
      shippingAddress: {
        name: String(row.name),
        email: String(row.email),
        phone: String(row.phone),
        address: String(row.address),
      },
      paymentMethod: row.paymentMethod as "cod" | "bank" | "card",
      notes: row.notes ? String(row.notes) : null,
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy chi tiết đơn hàng." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Cập nhật trạng thái đơn hàng
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { status } = body;

    // Xác thực trạng thái
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Trạng thái không hợp lệ. Phải là: pending, processing, shipped, delivered, hoặc cancelled",
        },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Kiểm tra đơn hàng tồn tại
    const [existingRows] = await connection.execute(
      "SELECT order_id FROM Orders WHERE order_id = ?",
      [params.id]
    );
    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Cập nhật trạng thái
    await connection.execute(
      "UPDATE Orders SET status = ? WHERE order_id = ?",
      [status, params.id]
    );

    return NextResponse.json({
      message: "Cập nhật trạng thái đơn hàng thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể cập nhật trạng thái đơn hàng." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

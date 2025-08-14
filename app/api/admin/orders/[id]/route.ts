import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { CartItem, Order } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

// Kết nối DB
async function getConnection() {
  return mysql.createConnection(config);
}

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

    // Lấy thông tin đơn hàng
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

    // Lấy OrderItems (đã dùng product_type + product_id)
    const [itemRows] = await connection.execute(
      `
      SELECT 
        oi.order_id,
        oi.product_type,
        oi.product_id,
        oi.quantity,
        oi.unit_price AS unitPrice
      FROM OrderItems oi
      WHERE oi.order_id = ?
      `,
      [params.id]
    );

    type OrderItemRow = {
      order_id: string;
      product_type: "wine" | "gift" | "accessory";
      product_id: number;
      quantity: number;
      unitPrice: number;
    };

    const itemsData = itemRows as OrderItemRow[];

    // Gom ID theo loại
    const productIds: Record<string, number[]> = {
      wine: [],
      gift: [],
      accessory: [],
    };
    itemsData.forEach((item) => {
      productIds[item.product_type].push(item.product_id);
    });

    // Lấy dữ liệu từng loại
    const productDetails: Record<string, any[]> = {
      wine: [],
      gift: [],
      accessory: [],
    };

    if (productIds.wine.length) {
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
        WHERE w.id IN (${productIds.wine.map(() => "?").join(", ")})
        GROUP BY w.id
        `,
        productIds.wine
      );
      productDetails.wine = wineRows as any[];
    }

    if (productIds.gift.length) {
      const [giftRows] = await connection.execute(
        `SELECT * FROM Gifts WHERE id IN (${productIds.gift
          .map(() => "?")
          .join(", ")})`,
        productIds.gift
      );
      productDetails.gift = giftRows as any[];
    }

    if (productIds.accessory.length) {
      const [accRows] = await connection.execute(
        `SELECT * FROM Accessories WHERE id IN (${productIds.accessory
          .map(() => "?")
          .join(", ")})`,
        productIds.accessory
      );
      productDetails.accessory = accRows as any[];
    }

    // Map dữ liệu
    const items: CartItem[] = itemsData
      .map((item) => {
        const details = productDetails[item.product_type].find(
          (p) => String(p.id) === String(item.product_id)
        );
        if (!details) return null;

        return {
          productType: item.product_type,
          [item.product_type]: {
            ...details,
            images: parseImages(details.images),
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
      })
      .filter((i): i is CartItem => i !== null);

    const order: Order = {
      id: String(row.id),
      orderCode: String(row.order_code),
      userId: String(row.userId),
      items,
      total: Number(row.total),
      status: row.status as Order["status"],
      createdAt: row.createdAt.toISOString(),
      shippingAddress: {
        name: String(row.name),
        email: String(row.email),
        phone: String(row.phone),
        address: String(row.address),
      },
      paymentMethod: row.paymentMethod as Order["paymentMethod"],
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

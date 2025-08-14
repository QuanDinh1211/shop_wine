import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { User, Order, CartItem } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
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

    // Lấy thông tin khách hàng
    const [customerRows] = await connection.execute(
      `SELECT id, email, name, phone, isAdmin
       FROM Customers
       WHERE id = ?`,
      [params.id]
    );
    const row = (customerRows as any[])[0];
    if (!row) {
      return NextResponse.json(
        { error: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    // Lấy đơn hàng
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
         o.notes
       FROM Orders o
       WHERE o.customer_id = ?`,
      [params.id]
    );

    const orderIds = (orderRows as any[]).map((o) => o.id);
    let items: (CartItem & { order_id: string })[] = [];

    if (orderIds.length > 0) {
      // Lấy tất cả OrderItems (dùng product_type + product_id)
      const [itemRows] = await connection.execute(
        `SELECT 
           oi.order_id,
           oi.product_id,
           oi.product_type,
           oi.quantity,
           oi.unit_price AS unitPrice
         FROM OrderItems oi
         WHERE oi.order_id IN (${orderIds.map(() => "?").join(", ")})`,
        orderIds
      );

      // Gom theo loại sản phẩm
      const productMap: Record<string, number[]> = {};
      (itemRows as any[]).forEach((item) => {
        if (!productMap[item.product_type]) {
          productMap[item.product_type] = [];
        }
        productMap[item.product_type].push(item.product_id);
      });

      const productDetails: Record<string, any[]> = {};

      // Wines
      if (productMap["wine"]?.length) {
        const [wineRows] = await connection.execute(
          `SELECT 
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
           WHERE w.id IN (${productMap["wine"].map(() => "?").join(", ")})
           GROUP BY w.id`,
          productMap["wine"]
        );
        productDetails["wine"] = wineRows as any[];
      }

      // Gifts
      if (productMap["gift"]?.length) {
        const [giftRows] = await connection.execute(
          `SELECT 
             id, 
             name, 
             price, 
             original_price AS originalPrice, 
             description, 
             images, 
             in_stock AS inStock, 
             featured, 
             gift_type AS giftType
           FROM Gifts
           WHERE id IN (${productMap["gift"].map(() => "?").join(", ")})`,
          productMap["gift"]
        );
        productDetails["gift"] = giftRows as any[];
      }

      // Accessories (join accessory_type)
      if (productMap["accessory"]?.length) {
        const [accRows] = await connection.execute(
          `SELECT 
             a.id, 
             a.name, 
             a.price, 
             a.original_price AS originalPrice, 
             a.description, 
             a.images, 
             a.in_stock AS inStock, 
             a.featured, 
             at.name AS accessoryType
           FROM Accessories a
           LEFT JOIN AccessoryTypes at ON a.accessory_type_id = at.id
           WHERE a.id IN (${productMap["accessory"]
             .map(() => "?")
             .join(", ")})`,
          productMap["accessory"]
        );
        productDetails["accessory"] = accRows as any[];
      }

      // Merge dữ liệu vào items
      items = (itemRows as any[])
        .map((item) => {
          const detail = productDetails[item.product_type]?.find(
            (p) => p.id === item.product_id
          );
          if (!detail) return null;
          return {
            order_id: String(item.order_id),
            productType: item.product_type,
            [item.product_type]: {
              ...detail,
              images: parseImages(detail.images),
            },
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          };
        })
        .filter((i) => i !== null);
    }

    // Gom đơn hàng + items
    const orders: Order[] = (orderRows as any[]).map((o) => ({
      id: String(o.id),
      orderCode: String(o.order_code),
      userId: String(o.userId),
      items: items
        .filter((it) => it.order_id === String(o.id))
        .map(({ order_id, ...rest }) => rest),
      total: Number(o.total),
      status: o.status as Order["status"],
      createdAt: o.createdAt.toISOString(),
      shippingAddress: {
        name: String(o.name),
        email: String(o.email),
        phone: String(o.phone),
        address: String(o.address),
        city: o.address.split(",").pop()?.trim() || "",
      },
      paymentMethod: o.paymentMethod as Order["paymentMethod"],
      notes: o.notes ? String(o.notes) : null,
    }));

    const customer: User = {
      id: String(row.id),
      email: String(row.email),
      name: String(row.name),
      phone: row.phone || undefined,
      address: undefined, // Customers không có address riêng
      isAdmin: Boolean(row.isAdmin),
      orders,
    };

    return NextResponse.json(customer);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết khách hàng:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy chi tiết khách hàng." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

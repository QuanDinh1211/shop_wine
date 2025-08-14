import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { User, Order, CartItem } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

// DB connection helper
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

  let connection;
  try {
    connection = await getConnection();

    // Lấy danh sách khách hàng
    const [customerRows] = await connection.execute(`
      SELECT 
        id,
        email,
        name,
        phone,
        isAdmin
      FROM Customers
    `);

    const customerIds = (customerRows as any[]).map((row) => row.id);
    let orders: Order[] = [];

    if (customerIds.length > 0) {
      // Lấy danh sách đơn hàng
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
          o.notes
        FROM Orders o
        WHERE o.customer_id IN (${customerIds.map(() => "?").join(", ")})
        `,
        customerIds
      );

      const orderIds = (orderRows as any[]).map((row) => row.id);
      let items: (CartItem & { order_id: string })[] = [];

      if (orderIds.length > 0) {
        // Lấy OrderItems
        const [itemRows] = await connection.execute(
          `
          SELECT 
            oi.order_id,
            oi.product_id,
            oi.product_type,
            oi.quantity,
            oi.unit_price AS unitPrice
          FROM OrderItems oi
          WHERE oi.order_id IN (${orderIds.map(() => "?").join(", ")})
          `,
          orderIds
        );

        // Gom ID theo loại sản phẩm
        const productMap: Record<string, number[]> = {};
        (itemRows as any[]).forEach((item) => {
          if (!productMap[item.product_type])
            productMap[item.product_type] = [];
          productMap[item.product_type].push(item.product_id);
        });

        // Chi tiết sản phẩm wine
        let wineDetails: any[] = [];
        if (productMap["wine"]?.length) {
          const placeholders = productMap["wine"].map(() => "?").join(", ");
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
            WHERE w.id IN (${placeholders})
            GROUP BY w.id
            `,
            productMap["wine"]
          );
          wineDetails = wineRows as any[];
        }

        // Lấy chi tiết Gift
        let giftDetails: any[] = [];
        if (productMap["gift"]?.length) {
          const giftPlaceholders = productMap["gift"].map(() => "?").join(", ");
          const [giftRows] = await connection.execute(
            `SELECT id, name, price, original_price AS originalPrice,
                  description, images, theme, in_stock AS inStock, featured, gift_type AS giftType
           FROM Gifts
           WHERE id IN (${giftPlaceholders})`,
            productMap["gift"]
          );
          giftDetails = giftRows as any[];
        }

        // Chi tiết sản phẩm accessory
        let accessoryDetails: any[] = [];
        if (productMap["accessory"]?.length) {
          const placeholders = productMap["accessory"]
            .map(() => "?")
            .join(", ");
          const [accRows] = await connection.execute(
            `
            SELECT 
              a.id,
              a.name,
              a.price,
              a.brand,
              a.original_price AS originalPrice,
              a.description,
              a.images,
              a.in_stock AS inStock,
              a.featured,
              a.accessory_type_id AS accessoryTypeId,
              at.name AS accessoryTypeName
            FROM Accessories a
            LEFT JOIN AccessoryTypes at 
              ON a.accessory_type_id = at.accessory_type_id
            WHERE a.id IN (${placeholders})
            `,
            productMap["accessory"]
          );
          accessoryDetails = accRows as any[];
        }

        // Kết hợp OrderItems với thông tin sản phẩm
        items = (itemRows as any[])
          .map<(CartItem & { order_id: string }) | null>((item) => {
            let product: any = null;

            if (item.product_type === "wine") {
              const w = wineDetails.find((x) => x.id === item.product_id);
              if (w) {
                product = {
                  ...w,
                  images: parseImages(w.images),
                  grapes: w.grapes ? w.grapes.split(",") : [],
                  pairings: w.pairings ? w.pairings.split(",") : [],
                };
              }
            }

            if (item.product_type === "gift") {
              const a = giftDetails.find((x) => x.id === item.product_id);
              if (a) {
                product = {
                  ...a,
                  images: parseImages(a.images),
                };
              }
            }

            if (item.product_type === "accessory") {
              const a = accessoryDetails.find((x) => x.id === item.product_id);
              if (a) {
                product = {
                  ...a,
                  images: parseImages(a.images),
                };
              }
            }

            if (!product) return null;

            return {
              order_id: String(item.order_id),
              productType: item.product_type,
              [item.product_type]: product,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
            };
          })
          .filter(
            (item): item is CartItem & { order_id: string } => item !== null
          );
      }

      // Kết hợp đơn hàng
      orders = (orderRows as any[]).map((row) => ({
        id: String(row.id),
        orderCode: String(row.order_code),
        userId: String(row.userId),
        items: items
          .filter((item) => String(item.order_id) === String(row.id))
          .map(({ order_id, ...cartItem }) => cartItem),
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
      }));
    }

    // Ghép customers + orders
    const customers: User[] = (customerRows as any[]).map((row) => ({
      id: String(row.id),
      email: String(row.email),
      name: String(row.name),
      phone: row.phone ? String(row.phone) : undefined,
      isAdmin: Boolean(row.isAdmin),
      orders: orders.filter((order) => String(order.userId) === String(row.id)),
    }));

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khách hàng:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy danh sách khách hàng." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

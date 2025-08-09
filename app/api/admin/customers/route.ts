import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { User, Order, CartItem, Wine } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách khách hàng
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
        // Lấy danh sách OrderItems
        const [itemRows] = await connection.execute(
          `
          SELECT 
            oi.order_id,
            oi.wine_id,
            oi.quantity,
            oi.unit_price AS unitPrice
          FROM OrderItems oi
          WHERE oi.order_id IN (${orderIds.map(() => "?").join(", ")})
          `,
          orderIds
        );

        // Lấy thông tin rượu
        const wineIds = (itemRows as any[]).map((item) => item.wine_id);
        let wineDetails: any[] = [];
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
          wineDetails = wineRows as any[];
        }

        // Kết hợp OrderItems với thông tin rượu
        items = (itemRows as any[])
          .map((item) => {
            const wine = wineDetails.find((w) => w.id === item.wine_id);
            if (!wine) return null;
            return {
              order_id: String(item.order_id),
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

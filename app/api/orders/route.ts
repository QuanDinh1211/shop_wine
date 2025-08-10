import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mysql, { RowDataPacket } from "mysql2/promise";
import { config } from "@/config/db";
import { parseImages } from "@/lib/utils";

interface Order extends RowDataPacket {
  order_id: number;
  order_code: string;
  customer_id: string;
  full_name: string;
  email: string;
  phone: string;
  order_date: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  notes: string | null;
}

interface OrderItem extends RowDataPacket {
  product_id: string;
  product_type: 'wine' | 'accessory';
  name: string;
  quantity: number;
  unit_price: number;
  images: string;
  winery?: string;
  country?: string;
  year?: number;
  accessory_type?: string;
  brand?: string;
}

export async function POST(request: Request) {
  try {
    // Xác thực người dùng qua JWT
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_12345"
    ) as { id: string };

    const customer_id = decoded.id;

    // Nhận dữ liệu đơn hàng từ client
    const {
      fullName,
      email,
      phone,
      address,
      paymentMethod,
      items,
      total,
      notes,
    } = await request.json();

    // Kiểm tra dữ liệu bắt buộc
    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !paymentMethod ||
      !items ||
      total === undefined
    ) {
      return NextResponse.json(
        { error: "Thiếu các trường bắt buộc" },
        { status: 400 }
      );
    }

    const safeNotes = notes !== undefined ? notes : null;

    const connection = await mysql.createConnection(config);
    await connection.beginTransaction();

    try {
      // Tạo bản ghi đơn hàng (tạm thời chưa có order_code)
      const [orderResult] = await connection.execute(
        `INSERT INTO Orders (
          customer_id, full_name, email, phone,
          total_amount, status, shipping_address,
          payment_method, notes, order_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customer_id,
          fullName,
          email,
          phone,
          total,
          "pending",
          address,
          paymentMethod,
          safeNotes,
          "TEMP", // placeholder để tạo sau
        ]
      );

      const order_id = (orderResult as any).insertId;

      // Tạo mã đơn hàng: ORD + YYYYMMDD + order_id padded
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
      const paddedId = String(order_id).padStart(4, "0");
      const order_code = `ORD${datePart}${paddedId}`;

      // Cập nhật order_code vào đơn hàng vừa tạo
      await connection.execute(
        `UPDATE Orders SET order_code = ? WHERE order_id = ?`,
        [order_code, order_id]
      );

      // Thêm các mục đơn hàng
      for (const item of items) {
        const product = item.wine || item.accessory;
        const productType = item.productType;

        if (!product?.id || !item.quantity || !product?.price) {
          throw new Error("Dữ liệu mục đơn hàng không hợp lệ");
        }

        await connection.execute(
          `INSERT INTO OrderItems (order_id, product_id, product_type, quantity, unit_price)
           VALUES (?, ?, ?, ?, ?)`,
          [order_id, product.id, productType, item.quantity, product.price]
        );
      }

      await connection.commit();

      return NextResponse.json({
        message: "Đơn hàng đã được tạo thành công",
        orderId: order_id,
        orderCode: order_code,
      });
    } catch (error: any) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error: any) {
    console.error("Lỗi tạo đơn hàng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Xác thực token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_12345"
    ) as { id: string };

    const customer_id = decoded.id;

    // Kết nối DB
    const connection = await mysql.createConnection(config);

    // Lấy danh sách đơn hàng
    const [orders] = await connection.execute<Order[]>(
      `SELECT 
        order_id, order_code, customer_id, full_name, email, phone, 
        order_date, total_amount, status, shipping_address, 
        payment_method, notes 
      FROM Orders 
      WHERE customer_id = ? 
      ORDER BY order_date DESC`,
      [customer_id]
    );

    // Duyệt từng đơn hàng để lấy danh sách sản phẩm
    const result = await Promise.all(
      orders.map(async (order) => {
        const [items] = await connection.execute<OrderItem[]>(
          `SELECT 
            oi.product_id, 
            oi.product_type,
            oi.quantity, 
            oi.unit_price,
            CASE 
              WHEN oi.product_type = 'wine' THEN w.name
              WHEN oi.product_type = 'accessory' THEN a.name
            END as name,
            CASE 
              WHEN oi.product_type = 'wine' THEN w.images
              WHEN oi.product_type = 'accessory' THEN a.images
            END as images,
            w.winery,
            c.name AS country,
            w.year,
            at.name AS accessory_type,
            a.brand
           FROM OrderItems oi 
           LEFT JOIN Wines w ON oi.product_id = w.id AND oi.product_type = 'wine'
           LEFT JOIN Countries c ON w.country_id = c.country_id
           LEFT JOIN Accessories a ON oi.product_id = a.id AND oi.product_type = 'accessory'
           LEFT JOIN AccessoryTypes at ON a.accessory_type_id = at.accessory_type_id
           WHERE oi.order_id = ?`,
          [order.order_id]
        );

        return {
          ...order,
          total_amount: Number(order.total_amount),
          items: items.map((item) => ({
            product_id: item.product_id,
            product_type: item.product_type,
            name: item.name,
            price: Number(item.unit_price),
            quantity: item.quantity,
            images: item.images ? parseImages(item.images) : [],
            // Wine specific fields
            winery: item.winery,
            country: item.country,
            year: item.year,
            // Accessory specific fields
            accessory_type: item.accessory_type,
            brand: item.brand,
          })),
        };
      })
    );

    await connection.end();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Lỗi lấy lịch sử đơn hàng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

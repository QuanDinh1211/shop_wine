import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";
import { config } from "@/config/db";
import { Order, DashboardStats } from "@/lib/types";

interface OrderRow extends RowDataPacket {
  order_id: number;
  customer_id: string;
  customer_name: string;
  full_name: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  order_date: string;
  shipping_address: string;
  payment_method: "cod" | "bank" | "card";
}

export async function GET(request: Request) {
  // Lấy token từ cookie
  const token = request.headers
    .get("cookie")
    ?.match(/admin-token=([^;]+)/)?.[1];

  if (!token) {
    return NextResponse.json(
      { error: "Yêu cầu token xác thực" },
      { status: 401 }
    );
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_12345"
    ) as {
      id: string;
      email: string;
      isAdmin: boolean;
    };

    // Kiểm tra quyền admin
    if (!decoded.isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền admin" },
        { status: 403 }
      );
    }

    // Tạo kết nối MySQL
    const connection = await mysql.createConnection(config);

    // Lấy tổng số rượu
    const [wineRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM Wines"
    );
    const totalWines = (wineRows as any[])[0].count || 0;

    // Lấy tổng số khách hàng
    const [customerRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM Customers"
    );
    const totalCustomers = (customerRows as any[])[0].count || 0;

    // Lấy tổng số đơn hàng và doanh thu
    const [orderRows] = await connection.execute(
      "SELECT COUNT(*) as count, SUM(total_amount) as total FROM Orders"
    );
    const totalOrders = (orderRows as any[])[0].count || 0;
    const totalRevenue = (orderRows as any[])[0].total || 0;

    // Lấy 5 đơn hàng gần nhất
    const [recentOrderRows]: [OrderRow[], any] = await connection.execute(
      `SELECT 
         o.order_id, 
         o.customer_id, 
         c.name as customer_name, 
         o.full_name, 
         o.total_amount, 
         o.status, 
         o.order_date, 
         o.shipping_address, 
         o.payment_method
       FROM Orders o
       LEFT JOIN Customers c ON o.customer_id = c.id
       ORDER BY o.order_date DESC
       LIMIT 5`
    );

    const recentOrders: Order[] = recentOrderRows.map((row) => ({
      id: row.order_id.toString(),
      userId: row.customer_id,
      items: [], // Không lấy items vì dashboard không sử dụng
      total: Number(row.total_amount) || 0,
      status: row.status || "pending",
      createdAt: row.order_date,
      shippingAddress: {
        name: row.full_name || row.customer_name || "Unknown",
        phone: row.phone || "",
        address: row.shipping_address || "",
        email: "", // Không có cột city riêng, lấy từ shipping_address nếu cần
      },
      paymentMethod: row.payment_method || "cod",
    }));

    // Đóng kết nối
    await connection.end();

    // Trả về dữ liệu
    const stats: DashboardStats = {
      totalWines,
      totalCustomers,
      totalOrders,
      totalRevenue: Number(totalRevenue),
      recentOrders,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Lỗi tải dữ liệu dashboard:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống, vui lòng thử lại" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

export async function GET() {
  try {
    const connection = await mysql.createConnection(config);
    const [orders] = await connection.execute(
      `SELECT o.*, c.name as full_name
       FROM Orders o
       JOIN Customers c ON o.customer_id = c.id`
    );
    await connection.end();
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách đơn hàng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const orderId = params.id;
    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Thiếu ID đơn hàng hoặc trạng thái" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(config);
    await connection.execute(
      "UPDATE Orders SET status = ? WHERE order_id = ?",
      [status, orderId]
    );
    await connection.end();
    return NextResponse.json(
      { message: "Cập nhật trạng thái thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

export async function GET() {
  try {
    const connection = await mysql.createConnection(config);

    const [revenue] = await connection.execute(
      "SELECT SUM(total_amount) as totalRevenue FROM Orders WHERE status != 'cancelled'"
    );
    const [orders] = await connection.execute(
      "SELECT COUNT(*) as totalOrders FROM Orders"
    );
    const [wines] = await connection.execute(
      "SELECT COUNT(*) as totalWines FROM Wines WHERE in_stock = TRUE"
    );
    const [pendingOrders] = await connection.execute(
      "SELECT COUNT(*) as pendingOrders FROM Orders WHERE status = 'pending'"
    );
    const [lowStockWines] = await connection.execute(
      "SELECT COUNT(*) as lowStockWines FROM Wines WHERE in_stock = TRUE AND stock_quantity < 10"
    );

    await connection.end();

    return NextResponse.json({
      totalRevenue: (revenue as any[])[0].totalRevenue || 0,
      totalOrders: (orders as any[])[0].totalOrders || 0,
      totalWines: (wines as any[])[0].totalWines || 0,
      pendingOrders: (pendingOrders as any[])[0].pendingOrders || 0,
      lowStockWines: (lowStockWines as any[])[0].lowStockWines || 0,
    });
  } catch (error: any) {
    console.error("Lỗi khi tải dữ liệu tổng quan:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

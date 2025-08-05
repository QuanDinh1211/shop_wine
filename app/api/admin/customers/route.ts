import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

export async function GET() {
  try {
    const connection = await mysql.createConnection(config);
    const [customers] = await connection.execute(
      "SELECT id, name, email, isAdmin FROM Customers"
    );
    await connection.end();
    return NextResponse.json(customers);
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách khách hàng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Thiếu token" }, { status: 400 });
    }

    // Xác minh token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key_12345"
      ) as {
        id: string;
        email: string;
        iat: number;
        exp: number;
      };
    } catch (error) {
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      );
    }

    // Kiểm tra user trong database
    const connection = await mysql.createConnection(config);
    const [users] = await connection.execute(
      "SELECT id, email, name, isAdmin FROM Customers WHERE id = ?",
      [decoded.id]
    );
    await connection.end();

    if ((users as any[]).length === 0) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: (users as any[])[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Lỗi khi kiểm tra token:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

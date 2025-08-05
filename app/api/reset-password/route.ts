import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "@/config/db";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Thiếu token hoặc mật khẩu" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(config);

    // Xác thực token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key_12345"
      ) as {
        customer_id: string;
        email: string;
      };
    } catch (error) {
      await connection.end();
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      );
    }

    // Kiểm tra token trong database
    const [tokens] = await connection.execute(
      "SELECT customer_id, expires_at FROM PasswordResetTokens WHERE token = ?",
      [token]
    );
    if ((tokens as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Token không hợp lệ" },
        { status: 401 }
      );
    }

    const { customer_id, expires_at } = (tokens as any[])[0];
    if (new Date(expires_at) < new Date()) {
      await connection.end();
      return NextResponse.json({ error: "Token đã hết hạn" }, { status: 401 });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu
    await connection.execute("UPDATE Customers SET password = ? WHERE id = ?", [
      hashedPassword,
      customer_id,
    ]);

    // Xóa token sau khi sử dụng
    await connection.execute(
      "DELETE FROM PasswordResetTokens WHERE token = ?",
      [token]
    );

    await connection.end();
    return NextResponse.json(
      { message: "Mật khẩu đã được đặt lại thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Kiểm tra email hợp lệ
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(config);

    // Kiểm tra email đã tồn tại
    const [existing] = await connection.execute(
      "SELECT email FROM NewsletterSubscribers WHERE email = ?",
      [email]
    );

    if ((existing as any[]).length > 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Email đã được đăng ký" },
        { status: 409 }
      );
    }

    // Lưu email vào database
    await connection.execute(
      "INSERT INTO NewsletterSubscribers (email) VALUES (?)",
      [email]
    );

    await connection.end();
    return NextResponse.json(
      { message: "Đăng ký thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Lỗi khi đăng ký newsletter:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Kiểm tra các trường bắt buộc
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Thiếu các trường bắt buộc" },
        { status: 400 }
      );
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    // Validate subject
    const validSubjects = [
      "general",
      "order",
      "wine-advice",
      "events",
      "corporate",
      "other",
    ];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { error: "Chủ đề không hợp lệ" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(config);

    // Lưu tin nhắn vào database
    await connection.execute(
      "INSERT INTO ContactMessages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message]
    );

    await connection.end();
    return NextResponse.json(
      { message: "Tin nhắn đã được gửi thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Lỗi khi gửi tin nhắn liên hệ:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

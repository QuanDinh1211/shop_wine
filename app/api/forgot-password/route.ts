import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { config } from "@/config/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(config);

    // Kiểm tra email tồn tại
    const [users] = await connection.execute(
      "SELECT id FROM Customers WHERE email = ?",
      [email]
    );
    if ((users as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Email không tồn tại" },
        { status: 404 }
      );
    }

    const customer_id = (users as any[])[0].id;

    // Tạo token
    const token = jwt.sign(
      { customer_id, email },
      process.env.JWT_SECRET || "your_jwt_secret_key_12345",
      { expiresIn: "1h" }
    );

    // Lưu token vào database
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // Hết hạn sau 1 giờ
    await connection.execute(
      "INSERT INTO PasswordResetTokens (customer_id, token, expires_at) VALUES (?, ?, ?)",
      [customer_id, token, expires_at]
    );

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: '"WineVault" <no-reply@vinocellar.com>',
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `
        <h2>Đặt lại mật khẩu</h2>
        <p>Nhấn vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
        <a href="${resetLink}" style="color: #b91c1c; text-decoration: underline;">Đặt lại mật khẩu</a>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    });

    await connection.end();
    return NextResponse.json(
      { message: "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Lỗi khi gửi yêu cầu quên mật khẩu:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

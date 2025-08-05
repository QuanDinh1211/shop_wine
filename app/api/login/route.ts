import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/config/db";
import { User } from "@/lib/types";

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(config);
    const [rows]: [UserRow[], any] = await connection.execute(
      "SELECT id, email, password, name, isAdmin FROM customers WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    const user = rows[0];

    

    // So sánh mật khẩu đã mã hóa
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // So sánh mật khẩu (plain text cho demo, thực tế nên dùng bcrypt)
    if (!isPasswordValid) {
      await connection.end();
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Tạo JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your_jwt_secret_key_12345",
      { expiresIn: "1h" }
    );

    // Trả về thông tin user (không bao gồm password)
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: !!user.isAdmin,
    };

    await connection.end();
    return NextResponse.json({ user: userData, token });
  } catch (error: any) {
    console.error("Login error:", error.message);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
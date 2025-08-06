import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/config/db";
import { User } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

interface UserRow extends RowDataPacket {
  email: string;
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, mật khẩu và tên là bắt buộc" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(config);

    // Kiểm tra email đã tồn tại
    const [existingUsers]: [UserRow[], any] = await connection.execute(
      "SELECT email FROM Customers WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 409 }
      );
    }

    // Hash mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo ID mới
    const id = uuidv4();

    // Thêm user vào database
    await connection.execute(
      "INSERT INTO Customers (id, email, password, name, isAdmin) VALUES (?, ?, ?, ?, ?)",
      [id, email, hashedPassword, name, false]
    );

    // Trả về thông tin user (không bao gồm password)
    const user: User = {
      id,
      email,
      name,
      isAdmin: false,
    };
    // Tạo JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your_jwt_secret_key_12345",
      { expiresIn: "12h" }
    );

    await connection.end();
    return NextResponse.json({ user: user, token });
  } catch (error: any) {
    console.error("Signup error:", error.message);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

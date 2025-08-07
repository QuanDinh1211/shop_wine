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

    // Kiểm tra đầu vào
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    // Tạo kết nối MySQL
    const connection = await mysql.createConnection(config);

    // Truy vấn người dùng
    const [rows]: [UserRow[], any] = await connection.execute(
      "SELECT id, email, password, name, isAdmin FROM Customers WHERE email = ?",
      [email]
    );

    // Kiểm tra người dùng tồn tại
    if (rows.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Kiểm tra quyền admin
    if (!user.isAdmin) {
      await connection.end();
      return NextResponse.json(
        { error: "Bạn không có quyền admin" },
        { status: 403 }
      );
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await connection.end();
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    console.log("JWT_SECRET login:", process.env.JWT_SECRET);

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your_jwt_secret_key_12345",
      { expiresIn: "12h" }
    );

    // Tạo dữ liệu người dùng để trả về
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: !!user.isAdmin,
    };

    // Đóng kết nối
    await connection.end();

    // Trả về phản hồi với token trong cookie và dữ liệu người dùng
    return NextResponse.json(
      { user: userData, token },
      {
        headers: {
          "Set-Cookie": `admin-token=${token}; Path=/; HttpOnly; Max-Age=43200; SameSite=Strict`, // 12 giờ
        },
      }
    );
  } catch (error: any) {
    console.error("Lỗi đăng nhập:", error.message);
    return NextResponse.json(
      { error: "Lỗi hệ thống, vui lòng thử lại" },
      { status: 500 }
    );
  }
}

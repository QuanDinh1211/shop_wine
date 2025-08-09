import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/lib/types";

export async function GET(request: Request) {
  // Lấy token từ cookie
  const token = request.headers
    .get("cookie")
    ?.match(/admin-token=([^;]+)/)?.[1];

  if (!token) {
    return NextResponse.json(
      { error: "Yêu cầu token xác thực" },
      { status: 401 }
    );
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_12345"
    ) as {
      id: string;
      email: string;
      isAdmin: boolean;
    };

    // Kiểm tra quyền admin
    if (!decoded.isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền admin" },
        { status: 403 }
      );
    }

    // Trả về dữ liệu ví dụ
    const userData: User = {
      id: decoded.id,
      email: decoded.email,
      name: "Admin User", // Giả lập, có thể lấy từ DB
      isAdmin: decoded.isAdmin,
    };

    return NextResponse.json({ message: "Đây là API bảo vệ", user: userData });
  } catch (error) {
    console.error("Lỗi xác minh token:", error);
    return NextResponse.json({ error: "Token không hợp lệ" }, { status: 401 });
  }
}

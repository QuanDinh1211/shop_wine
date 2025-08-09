import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Hàm kết nối DB
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách tất cả quốc gia
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const decoded = token && verifyAdminToken(token);

  if (!decoded) {
    return NextResponse.json(
      { error: "Bạn không có quyền truy cập" },
      { status: 403 }
    );
  }

  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT country_id AS id, name FROM Countries ORDER BY name"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách quốc gia:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy danh sách quốc gia." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Thêm quốc gia mới
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const decoded = token && verifyAdminToken(token);

  if (!decoded) {
    return NextResponse.json(
      { error: "Bạn không có quyền truy cập" },
      { status: 403 }
    );
  }

  let connection;
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Tên quốc gia là bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Thêm quốc gia nếu chưa tồn tại
    await connection.execute("INSERT INTO Countries (name) VALUES (?)", [name]);

    return NextResponse.json(
      { message: "Thêm quốc gia thành công" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi khi thêm quốc gia:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Quốc gia đã tồn tại" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể thêm quốc gia." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

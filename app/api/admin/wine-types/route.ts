import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Hàm kết nối DB
async function getConnection() {
  return mysql.createConnection(config);
}

// GET: Lấy danh sách loại rượu
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
      "SELECT wine_type_id AS id, name FROM WineTypes ORDER BY name"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại rượu:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy danh sách loại rượu." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// POST: Thêm loại rượu mới
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
        { error: "Tên loại rượu là bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.execute("INSERT INTO WineTypes (name) VALUES (?)", [name]);

    return NextResponse.json(
      { message: "Thêm loại rượu thành công" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi khi thêm loại rượu:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Loại rượu đã tồn tại" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể thêm loại rượu." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

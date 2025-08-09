import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Hàm kết nối CSDL
async function getConnection() {
  return mysql.createConnection(config);
}

// GET: Lấy danh sách grapes
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
      "SELECT grape_id AS id, name FROM Grapes ORDER BY name"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách grapes:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy danh sách grapes." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// POST: Thêm grape mới
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
        { error: "Tên giống nho là bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.execute("INSERT INTO Grapes (name) VALUES (?)", [name]);

    return NextResponse.json(
      { message: "Thêm giống nho thành công" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi khi thêm grape:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Giống nho đã tồn tại" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể thêm giống nho." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

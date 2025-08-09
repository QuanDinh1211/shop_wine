import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Hàm kết nối DB
async function getConnection() {
  return mysql.createConnection(config);
}

// GET: Lấy danh sách pairings
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
      "SELECT pairing_id AS id, name FROM Pairings ORDER BY name"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách pairings:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy danh sách pairings." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// POST: Thêm pairing mới
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
        { error: "Tên pairing là bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.execute("INSERT INTO Pairings (name) VALUES (?)", [name]);

    return NextResponse.json(
      { message: "Thêm pairing thành công" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi khi thêm pairing:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Pairing đã tồn tại" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể thêm pairing." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

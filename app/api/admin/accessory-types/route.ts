import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách loại phụ kiện
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

    const query = `
      SELECT 
        accessory_type_id,
        name
      FROM AccessoryTypes
      ORDER BY name ASC
    `;

    const [rows] = await connection.execute(query);

    const accessoryTypes = (rows as any[]).map((row) => ({
      id: row.accessory_type_id,
      name: row.name,
    }));

    return NextResponse.json(accessoryTypes);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại phụ kiện:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Thêm loại phụ kiện mới
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

    // Validate dữ liệu
    if (!name) {
      return NextResponse.json(
        { error: "Tên loại phụ kiện là bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const query = `
      INSERT INTO AccessoryTypes (name)
      VALUES (?)
    `;

    const [result] = await connection.execute(query, [name]);

    const insertId = (result as any).insertId;

    return NextResponse.json({
      message: "Thêm loại phụ kiện thành công",
      id: insertId,
    });
  } catch (error) {
    console.error("Lỗi khi thêm loại phụ kiện:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

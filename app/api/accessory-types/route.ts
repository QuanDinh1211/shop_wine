import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { AccessoryType } from "@/lib/types";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách loại phụ kiện
export async function GET() {
  let connection;
  try {
    connection = await getConnection();
    
    const query = `
      SELECT 
        accessory_type_id as accessoryTypeId,
        name
      FROM AccessoryTypes 
      ORDER BY name
    `;
    
    const [rows] = await connection.execute(query);
    
    const accessoryTypes: AccessoryType[] = (rows as any[]).map((row) => ({
      accessoryTypeId: Number(row.accessoryTypeId),
      name: String(row.name),
    }));

    return NextResponse.json(accessoryTypes);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể lấy danh sách loại phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Thêm loại phụ kiện mới
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Tên loại phụ kiện không được để trống" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Kiểm tra xem tên đã tồn tại chưa
    const checkQuery = "SELECT accessory_type_id FROM AccessoryTypes WHERE name = ?";
    const [existingRows] = await connection.execute(checkQuery, [name.trim()]);
    
    if ((existingRows as any[]).length > 0) {
      return NextResponse.json(
        { error: "Tên loại phụ kiện đã tồn tại" },
        { status: 400 }
      );
    }

    const insertQuery = "INSERT INTO AccessoryTypes (name) VALUES (?)";
    const [result] = await connection.execute(insertQuery, [name.trim()]);
    
    const accessoryTypeId = (result as any).insertId;
    
    const newAccessoryType: AccessoryType = {
      accessoryTypeId,
      name: name.trim(),
    };

    return NextResponse.json(newAccessoryType, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi thêm loại phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể thêm loại phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

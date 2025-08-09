import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { ContactMessage } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách tin nhắn
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
    const [messageRows] = await connection.execute(`
      SELECT 
        id,
        name,
        email,
        subject,
        message,
        created_at AS createdAt
      FROM ContactMessages
      ORDER BY created_at DESC
    `);

    const messages: ContactMessage[] = (messageRows as any[]).map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      email: String(row.email),
      subject: String(row.subject),
      message: String(row.message),
      createdAt: row.createdAt.toISOString(),
    }));

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tin nhắn:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy danh sách tin nhắn." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

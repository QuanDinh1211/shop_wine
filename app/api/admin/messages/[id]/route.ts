import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { ContactMessage } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy chi tiết tin nhắn theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const [messageRows] = await connection.execute(
      `
      SELECT 
        id,
        name,
        email,
        subject,
        message,
        created_at AS createdAt
      FROM ContactMessages
      WHERE id = ?
      `,
      [params.id]
    );

    const row = (messageRows as any[])[0];
    if (!row) {
      return NextResponse.json(
        { error: "Không tìm thấy tin nhắn" },
        { status: 404 }
      );
    }

    const message: ContactMessage = {
      id: Number(row.id),
      name: String(row.name),
      email: String(row.email),
      subject: String(row.subject),
      message: String(row.message),
      createdAt: row.createdAt.toISOString(),
    };

    return NextResponse.json(message);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết tin nhắn:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy chi tiết tin nhắn." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Xóa tin nhắn
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const [existingRows] = await connection.execute(
      "SELECT id FROM ContactMessages WHERE id = ?",
      [params.id]
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy tin nhắn" },
        { status: 404 }
      );
    }

    await connection.execute("DELETE FROM ContactMessages WHERE id = ?", [
      params.id,
    ]);

    return NextResponse.json({ message: "Xóa tin nhắn thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa tin nhắn:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể xóa tin nhắn." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

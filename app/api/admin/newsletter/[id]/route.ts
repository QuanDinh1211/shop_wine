import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Xóa người đăng ký
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
      "SELECT id FROM NewsletterSubscribers WHERE id = ?",
      [params.id]
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy người đăng ký" },
        { status: 404 }
      );
    }

    await connection.execute("DELETE FROM NewsletterSubscribers WHERE id = ?", [
      params.id,
    ]);

    return NextResponse.json({ message: "Xóa người đăng ký thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa người đăng ký:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể xóa người đăng ký." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

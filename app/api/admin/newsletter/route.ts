import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { NewsletterSubscriber } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy danh sách người đăng ký
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
    const [subscriberRows] = await connection.execute(`
      SELECT 
        id,
        email,
        subscribed_at AS subscribedAt
      FROM NewsletterSubscribers
      ORDER BY subscribed_at DESC
    `);

    const subscribers: NewsletterSubscriber[] = (subscriberRows as any[]).map(
      (row) => ({
        id: Number(row.id),
        email: String(row.email),
        subscribedAt: row.subscribedAt.toISOString(),
      })
    );

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người đăng ký:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy danh sách người đăng ký." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Thêm người đăng ký mới
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
    const { email } = body;

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    try {
      const [result] = await connection.execute(
        "INSERT INTO NewsletterSubscribers (email) VALUES (?)",
        [email.trim().toLowerCase()]
      );

      const insertId = (result as any).insertId;
      return NextResponse.json({
        id: insertId,
        email: email.trim().toLowerCase(),
        subscribedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { error: "Email đã tồn tại trong danh sách đăng ký" },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Lỗi khi thêm người đăng ký:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể thêm người đăng ký." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

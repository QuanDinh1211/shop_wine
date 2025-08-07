import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Country } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy chi tiết quốc gia theo ID
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
    const [countryRows] = await connection.execute(
      `
      SELECT 
        c.country_id AS id,
        c.name,
        COUNT(w.id) AS wineCount
      FROM Countries c
      LEFT JOIN Wines w ON c.country_id = w.country_id
      WHERE c.country_id = ?
      GROUP BY c.country_id, c.name
      `,
      [params.id]
    );

    const row = (countryRows as any[])[0];
    if (!row) {
      return NextResponse.json(
        { error: "Không tìm thấy quốc gia" },
        { status: 404 }
      );
    }

    const country: Country = {
      id: Number(row.id),
      name: String(row.name),
    };

    return NextResponse.json(country);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết quốc gia:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy chi tiết quốc gia." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Cập nhật quốc gia
export async function PUT(
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
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Tên quốc gia không hợp lệ" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    const [existingRows] = await connection.execute(
      "SELECT country_id FROM Countries WHERE country_id = ?",
      [params.id]
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy quốc gia" },
        { status: 404 }
      );
    }

    await connection.execute(
      "UPDATE Countries SET name = ? WHERE country_id = ?",
      [name.trim(), params.id]
    );

    return NextResponse.json({
      id: Number(params.id),
      name: name.trim(),
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật quốc gia:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể cập nhật quốc gia." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Xóa quốc gia
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
    const [wineRows] = await connection.execute(
      "SELECT id FROM Wines WHERE country_id = ?",
      [params.id]
    );

    if ((wineRows as any[]).length > 0) {
      return NextResponse.json(
        { error: "Không thể xóa quốc gia vì có rượu liên quan" },
        { status: 400 }
      );
    }

    const [existingRows] = await connection.execute(
      "SELECT country_id FROM Countries WHERE country_id = ?",
      [params.id]
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy quốc gia" },
        { status: 404 }
      );
    }

    await connection.execute("DELETE FROM Countries WHERE country_id = ?", [
      params.id,
    ]);

    return NextResponse.json({ message: "Xóa quốc gia thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa quốc gia:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể xóa quốc gia." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

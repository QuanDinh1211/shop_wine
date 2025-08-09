import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { WineType, Wine } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy chi tiết loại rượu theo ID
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
    const [wineTypeRows] = await connection.execute(
      `
      SELECT 
        wt.wine_type_id AS id,
        wt.name,
        COUNT(w.id) AS wineCount
      FROM WineTypes wt
      LEFT JOIN Wines w ON wt.wine_type_id = w.wine_type_id
      WHERE wt.wine_type_id = ?
      GROUP BY wt.wine_type_id, wt.name
      `,
      [params.id]
    );

    const row = (wineTypeRows as any[])[0];
    if (!row) {
      return NextResponse.json(
        { error: "Không tìm thấy loại rượu" },
        { status: 404 }
      );
    }

    const wineType: WineType = {
      id: Number(row.id),
      name: String(row.name),
    };

    return NextResponse.json(wineType);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết loại rượu:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy chi tiết loại rượu." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Cập nhật loại rượu
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
        { error: "Tên loại rượu không hợp lệ" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    const [existingRows] = await connection.execute(
      "SELECT wine_type_id FROM WineTypes WHERE wine_type_id = ?",
      [params.id]
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại rượu" },
        { status: 404 }
      );
    }

    await connection.execute(
      "UPDATE WineTypes SET name = ? WHERE wine_type_id = ?",
      [name.trim(), params.id]
    );

    return NextResponse.json({
      id: Number(params.id),
      name: name.trim(),
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật loại rượu:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể cập nhật loại rượu." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Xóa loại rượu
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
      "SELECT id FROM Wines WHERE wine_type_id = ?",
      [params.id]
    );

    if ((wineRows as any[]).length > 0) {
      return NextResponse.json(
        { error: "Không thể xóa loại rượu vì có rượu liên quan" },
        { status: 400 }
      );
    }

    const [existingRows] = await connection.execute(
      "SELECT wine_type_id FROM WineTypes WHERE wine_type_id = ?",
      [params.id]
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại rượu" },
        { status: 404 }
      );
    }

    await connection.execute("DELETE FROM WineTypes WHERE wine_type_id = ?", [
      params.id,
    ]);

    return NextResponse.json({ message: "Xóa loại rượu thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa loại rượu:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể xóa loại rượu." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

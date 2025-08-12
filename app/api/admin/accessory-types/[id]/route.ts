import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Cập nhật loại phụ kiện
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
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID loại phụ kiện là bắt buộc" },
        { status: 400 }
      );
    }

    const { name } = body;

    // Validate dữ liệu
    if (!name) {
      return NextResponse.json(
        { error: "Tên loại phụ kiện là bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Kiểm tra loại phụ kiện có tồn tại không
    const checkQuery =
      "SELECT accessory_type_id FROM AccessoryTypes WHERE accessory_type_id = ?";
    const [checkResult] = await connection.execute(checkQuery, [id]);

    if ((checkResult as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại phụ kiện" },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE AccessoryTypes SET
        name = ?
      WHERE accessory_type_id = ?
    `;

    await connection.execute(updateQuery, [name, id]);

    return NextResponse.json({
      message: "Cập nhật loại phụ kiện thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật loại phụ kiện:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Xóa loại phụ kiện
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
    // Xác thực admin

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID loại phụ kiện là bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Kiểm tra loại phụ kiện có tồn tại không
    const checkQuery =
      "SELECT accessory_type_id FROM AccessoryTypes WHERE accessory_type_id = ?";
    const [checkResult] = await connection.execute(checkQuery, [id]);

    if ((checkResult as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại phụ kiện" },
        { status: 404 }
      );
    }

    // Kiểm tra xem có phụ kiện nào đang sử dụng loại này không
    const checkUsageQuery =
      "SELECT id FROM Accessories WHERE accessory_type_id = ? LIMIT 1";
    const [usageResult] = await connection.execute(checkUsageQuery, [id]);

    if ((usageResult as any[]).length > 0) {
      return NextResponse.json(
        {
          error: "Không thể xóa loại phụ kiện này vì đang có phụ kiện sử dụng",
        },
        { status: 400 }
      );
    }

    // Xóa loại phụ kiện
    const deleteQuery =
      "DELETE FROM AccessoryTypes WHERE accessory_type_id = ?";
    await connection.execute(deleteQuery, [id]);

    return NextResponse.json({
      message: "Xóa loại phụ kiện thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa loại phụ kiện:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

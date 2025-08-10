import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { AccessoryType } from "@/lib/types";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy chi tiết loại phụ kiện
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    const query = `
      SELECT 
        accessory_type_id as accessoryTypeId,
        name
      FROM AccessoryTypes 
      WHERE accessory_type_id = ?
    `;
    
    const [rows] = await connection.execute(query, [id]);
    
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại phụ kiện" },
        { status: 404 }
      );
    }
    
    const row = (rows as any[])[0];
    const accessoryType: AccessoryType = {
      accessoryTypeId: Number(row.accessoryTypeId),
      name: String(row.name),
    };

    return NextResponse.json(accessoryType);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết loại phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể lấy chi tiết loại phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Cập nhật loại phụ kiện
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name } = body;

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Tên loại phụ kiện không được để trống" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Kiểm tra xem loại phụ kiện có tồn tại không
    const checkQuery = "SELECT accessory_type_id FROM AccessoryTypes WHERE accessory_type_id = ?";
    const [existingRows] = await connection.execute(checkQuery, [id]);
    
    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại phụ kiện" },
        { status: 404 }
      );
    }

    // Kiểm tra xem tên mới đã tồn tại chưa (trừ chính nó)
    const duplicateQuery = "SELECT accessory_type_id FROM AccessoryTypes WHERE name = ? AND accessory_type_id != ?";
    const [duplicateRows] = await connection.execute(duplicateQuery, [name.trim(), id]);
    
    if ((duplicateRows as any[]).length > 0) {
      return NextResponse.json(
        { error: "Tên loại phụ kiện đã tồn tại" },
        { status: 400 }
      );
    }

    const updateQuery = "UPDATE AccessoryTypes SET name = ? WHERE accessory_type_id = ?";
    await connection.execute(updateQuery, [name.trim(), id]);
    
    const updatedAccessoryType: AccessoryType = {
      accessoryTypeId: id,
      name: name.trim(),
    };

    return NextResponse.json(updatedAccessoryType);
  } catch (error) {
    console.error("Lỗi khi cập nhật loại phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể cập nhật loại phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Xóa loại phụ kiện
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Kiểm tra xem loại phụ kiện có tồn tại không
    const checkQuery = "SELECT accessory_type_id FROM AccessoryTypes WHERE accessory_type_id = ?";
    const [existingRows] = await connection.execute(checkQuery, [id]);
    
    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại phụ kiện" },
        { status: 404 }
      );
    }

    // Kiểm tra xem có phụ kiện nào đang sử dụng loại này không
    const checkUsageQuery = "SELECT id FROM Accessories WHERE accessory_type_id = ? LIMIT 1";
    const [usageRows] = await connection.execute(checkUsageQuery, [id]);
    
    if ((usageRows as any[]).length > 0) {
      return NextResponse.json(
        { error: "Không thể xóa loại phụ kiện đang được sử dụng" },
        { status: 400 }
      );
    }

    const deleteQuery = "DELETE FROM AccessoryTypes WHERE accessory_type_id = ?";
    await connection.execute(deleteQuery, [id]);

    return NextResponse.json({ message: "Xóa loại phụ kiện thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa loại phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể xóa loại phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

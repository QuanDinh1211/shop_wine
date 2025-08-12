import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { parseImages } from "@/lib/utils";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy thông tin phụ kiện theo ID
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
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID phụ kiện là bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const query = `
      SELECT 
        a.id,
        a.name,
        a.accessory_type_id,
        at.name as accessory_type,
        a.price,
        a.original_price,
        a.description,
        a.images,
        a.in_stock,
        a.featured,
        a.brand,
        a.material,
        a.color,
        a.size
      FROM Accessories a
      LEFT JOIN AccessoryTypes at ON a.accessory_type_id = at.accessory_type_id
      WHERE a.id = ?
    `;

    const [rows] = await connection.execute(query, [id]);

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy phụ kiện" },
        { status: 404 }
      );
    }

    const row = (rows as any[])[0];
    const accessory = {
      id: row.id,
      name: row.name,
      accessoryTypeId: row.accessory_type_id,
      accessoryType: row.accessory_type,
      price: row.price,
      originalPrice: row.original_price,
      description: row.description,
      images: parseImages(row.images),
      inStock: Boolean(row.in_stock),
      featured: Boolean(row.featured),
      brand: row.brand,
      material: row.material,
      color: row.color,
      size: row.size,
    };

    return NextResponse.json(accessory);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phụ kiện:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Cập nhật phụ kiện
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
        { error: "ID phụ kiện là bắt buộc" },
        { status: 400 }
      );
    }

    const {
      name,
      accessoryTypeId,
      price,
      originalPrice,
      description,
      images,
      inStock,
      featured,
      brand,
      material,
      color,
      size,
    } = body;

    // Validate dữ liệu
    if (!name || !accessoryTypeId || !price) {
      return NextResponse.json(
        { error: "Tên, loại và giá là bắt buộc" },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Giá phải lớn hơn 0" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Kiểm tra phụ kiện có tồn tại không
    const checkQuery = "SELECT id FROM Accessories WHERE id = ?";
    const [checkResult] = await connection.execute(checkQuery, [id]);

    if ((checkResult as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy phụ kiện" },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE Accessories SET
        name = ?,
        accessory_type_id = ?,
        price = ?,
        original_price = ?,
        description = ?,
        images = ?,
        in_stock = ?,
        featured = ?,
        brand = ?,
        material = ?,
        color = ?,
        size = ?
      WHERE id = ?
    `;

    await connection.execute(updateQuery, [
      name,
      accessoryTypeId,
      price,
      originalPrice || null,
      description || null,
      JSON.stringify(images || []),
      inStock ? 1 : 0,
      featured ? 1 : 0,
      brand || null,
      material || null,
      color || null,
      size || null,
      id,
    ]);

    return NextResponse.json({
      message: "Cập nhật phụ kiện thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật phụ kiện:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Xóa phụ kiện
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
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID phụ kiện là bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Kiểm tra phụ kiện có tồn tại không
    const checkQuery = "SELECT id FROM Accessories WHERE id = ?";
    const [checkResult] = await connection.execute(checkQuery, [id]);

    if ((checkResult as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy phụ kiện" },
        { status: 404 }
      );
    }

    // Xóa phụ kiện
    const deleteQuery = "DELETE FROM Accessories WHERE id = ?";
    await connection.execute(deleteQuery, [id]);

    return NextResponse.json({
      message: "Xóa phụ kiện thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa phụ kiện:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

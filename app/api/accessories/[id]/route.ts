import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { Accessory } from "@/lib/types";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy chi tiết phụ kiện
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID phụ kiện không được để trống" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    const query = `
      SELECT 
        a.id,
        a.name,
        a.accessory_type_id as accessoryTypeId,
        at.name as accessoryType,
        a.price,
        a.original_price as originalPrice,
        a.description,
        a.images,
        a.in_stock as inStock,
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
    const accessory: Accessory = {
      id: String(row.id),
      name: String(row.name),
      accessoryTypeId: Number(row.accessoryTypeId),
      accessoryType: String(row.accessoryType),
      price: parseFloat(row.price),
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
      description: row.description ? String(row.description) : null,
      images: parseImages(row.images),
      inStock: Boolean(row.inStock),
      featured: Boolean(row.featured),
      brand: row.brand ? String(row.brand) : null,
      material: row.material ? String(row.material) : null,
      color: row.color ? String(row.color) : null,
      size: row.size ? String(row.size) : null,
    };

    return NextResponse.json(accessory);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể lấy chi tiết phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Cập nhật phụ kiện
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const { id } = params;
    const body = await request.json();
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

    if (!id) {
      return NextResponse.json(
        { error: "ID phụ kiện không được để trống" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Kiểm tra xem phụ kiện có tồn tại không
    const checkQuery = "SELECT id FROM Accessories WHERE id = ?";
    const [existingRows] = await connection.execute(checkQuery, [id]);
    
    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy phụ kiện" },
        { status: 404 }
      );
    }

    // Validation
    if (name && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Tên phụ kiện không được để trống" },
        { status: 400 }
      );
    }

    if (accessoryTypeId && isNaN(Number(accessoryTypeId))) {
      return NextResponse.json(
        { error: "Loại phụ kiện không hợp lệ" },
        { status: 400 }
      );
    }

    if (price && (isNaN(Number(price)) || Number(price) <= 0)) {
      return NextResponse.json(
        { error: "Giá phụ kiện phải lớn hơn 0" },
        { status: 400 }
      );
    }

    // Kiểm tra loại phụ kiện nếu có thay đổi
    if (accessoryTypeId) {
      const checkTypeQuery = "SELECT accessory_type_id FROM AccessoryTypes WHERE accessory_type_id = ?";
      const [typeRows] = await connection.execute(checkTypeQuery, [accessoryTypeId]);
      
      if ((typeRows as any[]).length === 0) {
        return NextResponse.json(
          { error: "Loại phụ kiện không tồn tại" },
          { status: 400 }
        );
      }
    }

    // Xây dựng câu lệnh UPDATE động
    let updateFields: string[] = [];
    let updateParams: any[] = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateParams.push(name.trim());
    }

    if (accessoryTypeId !== undefined) {
      updateFields.push("accessory_type_id = ?");
      updateParams.push(accessoryTypeId);
    }

    if (price !== undefined) {
      updateFields.push("price = ?");
      updateParams.push(price);
    }

    if (originalPrice !== undefined) {
      updateFields.push("original_price = ?");
      updateParams.push(originalPrice);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      updateParams.push(description);
    }

    if (images !== undefined) {
      updateFields.push("images = ?");
      updateParams.push(images ? JSON.stringify(images) : null);
    }

    if (inStock !== undefined) {
      updateFields.push("in_stock = ?");
      updateParams.push(inStock ? 1 : 0);
    }

    if (featured !== undefined) {
      updateFields.push("featured = ?");
      updateParams.push(featured ? 1 : 0);
    }

    if (brand !== undefined) {
      updateFields.push("brand = ?");
      updateParams.push(brand);
    }

    if (material !== undefined) {
      updateFields.push("material = ?");
      updateParams.push(material);
    }

    if (color !== undefined) {
      updateFields.push("color = ?");
      updateParams.push(color);
    }

    if (size !== undefined) {
      updateFields.push("size = ?");
      updateParams.push(size);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "Không có dữ liệu nào để cập nhật" },
        { status: 400 }
      );
    }

    updateParams.push(id);
    const updateQuery = `UPDATE Accessories SET ${updateFields.join(", ")} WHERE id = ?`;
    await connection.execute(updateQuery, updateParams);

    // Lấy thông tin cập nhật
    const selectQuery = `
      SELECT 
        a.id,
        a.name,
        a.accessory_type_id as accessoryTypeId,
        at.name as accessoryType,
        a.price,
        a.original_price as originalPrice,
        a.description,
        a.images,
        a.in_stock as inStock,
        a.featured,
        a.brand,
        a.material,
        a.color,
        a.size
      FROM Accessories a
      LEFT JOIN AccessoryTypes at ON a.accessory_type_id = at.accessory_type_id
      WHERE a.id = ?
    `;
    
    const [rows] = await connection.execute(selectQuery, [id]);
    const row = (rows as any[])[0];
    
    const updatedAccessory: Accessory = {
      id: String(row.id),
      name: String(row.name),
      accessoryTypeId: Number(row.accessoryTypeId),
      accessoryType: String(row.accessoryType),
      price: parseFloat(row.price),
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
      description: row.description ? String(row.description) : null,
      images: parseImages(row.images),
      inStock: Boolean(row.inStock),
      featured: Boolean(row.featured),
      brand: row.brand ? String(row.brand) : null,
      material: row.material ? String(row.material) : null,
      color: row.color ? String(row.color) : null,
      size: row.size ? String(row.size) : null,
    };

    return NextResponse.json(updatedAccessory);
  } catch (error) {
    console.error("Lỗi khi cập nhật phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể cập nhật phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Xóa phụ kiện
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "ID phụ kiện không được để trống" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Kiểm tra xem phụ kiện có tồn tại không
    const checkQuery = "SELECT id FROM Accessories WHERE id = ?";
    const [existingRows] = await connection.execute(checkQuery, [id]);
    
    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy phụ kiện" },
        { status: 404 }
      );
    }

    // Kiểm tra xem phụ kiện có trong đơn hàng nào không
    const checkOrderQuery = "SELECT order_item_id FROM OrderItems WHERE product_id = ? AND product_type = 'accessory' LIMIT 1";
    const [orderRows] = await connection.execute(checkOrderQuery, [id]);
    
    if ((orderRows as any[]).length > 0) {
      return NextResponse.json(
        { error: "Không thể xóa phụ kiện đang được sử dụng trong đơn hàng" },
        { status: 400 }
      );
    }

    const deleteQuery = "DELETE FROM Accessories WHERE id = ?";
    await connection.execute(deleteQuery, [id]);

    return NextResponse.json({ message: "Xóa phụ kiện thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa phụ kiện:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống. Không thể xóa phụ kiện.",
        details: (error as any).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

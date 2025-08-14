import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Gift } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy thông tin quà tặng theo ID
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
    connection = await getConnection();

    const [giftsResult] = await connection.execute(
      "SELECT * FROM Gifts WHERE id = ?",
      [id]
    );

    const gifts = giftsResult as any[];
    if (gifts.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 }
      );
    }

    const gift = gifts[0];
    const giftData: Gift = {
      id: gift.id,
      name: gift.name,
      price: parseFloat(gift.price),
      originalPrice: gift.original_price
        ? parseFloat(gift.original_price)
        : null,
      description: gift.description,
      images: parseImages(gift.images),
      inStock: Boolean(gift.in_stock),
      featured: Boolean(gift.featured),
      giftType: gift.gift_type,
      includeWine: Boolean(gift.include_wine),
      theme: gift.theme,
      packaging: gift.packaging,
      items: parseImages(gift.items),
      createdAt: gift.created_at,
    };

    return NextResponse.json(giftData);
  } catch (error: any) {
    console.error("Lỗi khi lấy thông tin quà tặng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Cập nhật quà tặng
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
    const giftData: Gift = await request.json();

    // Validate dữ liệu
    if (!giftData.name || !giftData.price || !giftData.giftType) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Kiểm tra quà tặng có tồn tại không
    const [existingGifts] = await connection.execute(
      "SELECT id FROM Gifts WHERE id = ?",
      [id]
    );

    if ((existingGifts as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE Gifts SET 
        name = ?, price = ?, original_price = ?, description = ?, 
        images = ?, in_stock = ?, featured = ?, gift_type = ?, 
        include_wine = ?, theme = ?, packaging = ?, items = ?
      WHERE id = ?
    `;

    await connection.execute(updateQuery, [
      giftData.name,
      giftData.price,
      giftData.originalPrice || null,
      giftData.description || null,
      JSON.stringify(giftData.images || []),
      giftData.inStock ? 1 : 0,
      giftData.featured ? 1 : 0,
      giftData.giftType,
      giftData.includeWine ? 1 : 0,
      giftData.theme || null,
      giftData.packaging || null,
      JSON.stringify(giftData.items || []),
      id,
    ]);

    return NextResponse.json({
      message: "Cập nhật quà tặng thành công",
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật quà tặng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Xóa quà tặng
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
    connection = await getConnection();

    // Kiểm tra quà tặng có tồn tại không
    const [existingGifts] = await connection.execute(
      "SELECT id FROM Gifts WHERE id = ?",
      [id]
    );

    if ((existingGifts as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 }
      );
    }

    // Xóa quà tặng
    await connection.execute("DELETE FROM Gifts WHERE id = ?", [id]);

    return NextResponse.json({
      message: "Xóa quà tặng thành công",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa quà tặng:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

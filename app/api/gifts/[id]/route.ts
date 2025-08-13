import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";
import { parseImages } from "@/lib/utils";

async function getConnection() {
  return mysql.createConnection(config);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const { id } = params;
    connection = await getConnection();

    // Fetch the main gift
    const [giftRows] = await connection.execute(
      "SELECT * FROM Gifts WHERE id = ?",
      [id]
    );

    if ((giftRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 }
      );
    }

    const r = (giftRows as any[])[0];
    const gift = {
      id: String(r.id),
      name: String(r.name),
      price: parseFloat(r.price),
      originalPrice: r.original_price ? parseFloat(r.original_price) : null,
      description: r.description ? String(r.description) : null,
      images: parseImages(r.images),
      inStock: Boolean(r.in_stock),
      featured: Boolean(r.featured),
      giftType: String(r.gift_type),
      includeWine: Boolean(r.include_wine),
      theme: r.theme ? String(r.theme) : null,
      packaging: r.packaging ? String(r.packaging) : null,
      items: Array.isArray(r.items) ? r.items : parseImages(r.items),
    };

    // Fetch related gifts based on giftType and theme
    let relatedGifts: any[] = [];
    try {
      const [relatedRows] = await connection.execute(
        `SELECT * FROM Gifts 
         WHERE id != ? 
         AND (gift_type = ? OR theme = ? OR include_wine = ?)
         AND in_stock = 1
         LIMIT 4`,
        [id, r.gift_type, r.theme || "", r.include_wine]
      );

      relatedGifts = (relatedRows as any[]).map((row) => ({
        id: String(row.id),
        name: String(row.name),
        price: parseFloat(row.price),
        originalPrice: row.original_price
          ? parseFloat(row.original_price)
          : null,
        description: row.description ? String(row.description) : null,
        images: parseImages(row.images),
        inStock: Boolean(row.in_stock),
        featured: Boolean(row.featured),
        giftType: String(row.gift_type),
        includeWine: Boolean(row.include_wine),
        theme: row.theme ? String(row.theme) : null,
        packaging: row.packaging ? String(row.packaging) : null,
        items: Array.isArray(row.items) ? row.items : parseImages(row.items),
      }));
    } catch (relatedError) {
      console.error("Lỗi lấy quà tặng liên quan:", relatedError);
      // Continue without related gifts if there's an error
    }

    return NextResponse.json({ gift, relatedGifts });
  } catch (error: any) {
    console.error("Lỗi lấy quà tặng:", error);
    return NextResponse.json(
      { error: "Không thể lấy quà tặng", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

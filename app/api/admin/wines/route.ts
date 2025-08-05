import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

export async function GET() {
  try {
    const connection = await mysql.createConnection(config);
    const [wines] = await connection.execute(
      `SELECT w.*, wt.name as wine_type_name, c.name as country_name
       FROM Wines w
       JOIN WineTypes wt ON w.wine_type_id = wt.wine_type_id
       JOIN Countries c ON w.country_id = c.country_id`
    );
    await connection.end();
    return NextResponse.json(wines);
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách rượu:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      id,
      name,
      wine_type_id,
      country_id,
      region,
      year,
      price,
      original_price,
      description,
      images,
      in_stock,
      featured,
      alcohol,
      volume,
      winery,
      serving_temp,
      stock_quantity,
    } = await request.json();

    if (
      !id ||
      !name ||
      !wine_type_id ||
      !country_id ||
      !price ||
      !stock_quantity
    ) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(config);
    await connection.execute(
      `INSERT INTO Wines (id, name, wine_type_id, country_id, region, year, price, original_price, 
         description, images, in_stock, featured, alcohol, volume, winery, serving_temp, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        wine_type_id,
        country_id,
        region || null,
        year || null,
        price,
        original_price || null,
        description || null,
        JSON.stringify(images || []),
        in_stock ?? true,
        featured ?? false,
        alcohol || null,
        volume || null,
        winery || null,
        serving_temp || null,
        stock_quantity,
      ]
    );
    await connection.end();
    return NextResponse.json(
      { message: "Thêm rượu thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Lỗi khi thêm rượu:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wineId = searchParams.get("id");
    if (!wineId) {
      return NextResponse.json({ error: "Thiếu ID rượu" }, { status: 400 });
    }

    const connection = await mysql.createConnection(config);
    await connection.execute("DELETE FROM WineGrapes WHERE wine_id = ?", [
      wineId,
    ]);
    await connection.execute("DELETE FROM WinePairings WHERE wine_id = ?", [
      wineId,
    ]);
    await connection.execute("DELETE FROM Wines WHERE id = ?", [wineId]);
    await connection.end();
    return NextResponse.json(
      { message: "Xóa rượu thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Lỗi khi xóa rượu:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

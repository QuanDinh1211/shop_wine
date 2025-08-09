import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Wine } from "@/lib/admin/types";
import { config } from "@/config/db";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/admin/auth";
import { parseImages } from "@/lib/utils";

// Kết nối cơ sở dữ liệu
async function getConnection() {
  return mysql.createConnection(config);
}

// Lấy chi tiết rượu theo ID
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
    const [rows] = await connection.execute(
      `
      SELECT 
        w.id,
        w.name,
        wt.name AS type,
        w.wine_type_id AS wineTypeId,
        c.name AS country,
        w.country_id AS countryId,
        w.region,
        w.year,
        w.price,
        w.original_price AS originalPrice,
        w.rating,
        w.reviews,
        w.description,
        w.images,
        w.in_stock AS inStock,
        w.featured,
        w.alcohol,
        w.volume,
        w.winery,
        w.serving_temp AS servingTemp,
        GROUP_CONCAT(DISTINCT g.name) AS grapes,
        GROUP_CONCAT(DISTINCT p.name) AS pairings
      FROM Wines w
      LEFT JOIN WineTypes wt ON w.wine_type_id = wt.wine_type_id
      LEFT JOIN Countries c ON w.country_id = c.country_id
      LEFT JOIN WineGrapes wg ON w.id = wg.wine_id
      LEFT JOIN Grapes g ON wg.grape_id = g.grape_id
      LEFT JOIN WinePairings wp ON w.id = wp.wine_id
      LEFT JOIN Pairings p ON wp.pairing_id = p.pairing_id
      WHERE w.id = ?
      GROUP BY w.id
      `,
      [params.id]
    );

    const row = (rows as any[])[0];
    if (!row) {
      return NextResponse.json(
        { error: "Không tìm thấy rượu" },
        { status: 404 }
      );
    }

    const wine: Wine = {
      id: row.id,
      name: row.name,
      type: row.type,
      wineTypeId: row.wineTypeId,
      country: row.country,
      countryId: row.countryId,
      region: row.region,
      year: row.year,
      price: parseFloat(row.price),
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
      rating: row.rating ? parseFloat(row.rating) : null,
      reviews: row.reviews,
      description: row.description,
      images: parseImages(row.images),
      inStock: row.inStock,
      featured: row.featured,
      alcohol: row.alcohol ? parseFloat(row.alcohol) : null,
      volume: row.volume,
      winery: row.winery,
      servingTemp: row.servingTemp,
      grapes: row.grapes ? row.grapes.split(",") : [],
      pairings: row.pairings ? row.pairings.split(",") : [],
    };

    return NextResponse.json(wine);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết rượu:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể lấy chi tiết rượu." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Cập nhật rượu
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
    const {
      name,
      type,
      country,
      region,
      year,
      price,
      originalPrice,
      rating,
      reviews,
      description,
      images,
      inStock,
      featured,
      alcohol,
      volume,
      winery,
      servingTemp,
      grapes,
      pairings,
    } = body;

    // Xác thực dữ liệu đầu vào
    if (!name || !type || !country || !price) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc: name, type, country, price" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Kiểm tra rượu tồn tại
    const [existingRows] = await connection.execute(
      "SELECT id FROM Wines WHERE id = ?",
      [params.id]
    );
    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy rượu" },
        { status: 404 }
      );
    }

    // Lấy wine_type_id
    const [typeRows] = await connection.execute(
      "SELECT wine_type_id FROM WineTypes WHERE name = ?",
      [type]
    );
    const wineType = (typeRows as any[])[0];
    if (!wineType) {
      return NextResponse.json(
        { error: "Loại rượu không hợp lệ" },
        { status: 400 }
      );
    }

    // Lấy country_id
    const [countryRows] = await connection.execute(
      "SELECT country_id FROM Countries WHERE name = ?",
      [country]
    );
    const countryData = (countryRows as any[])[0];
    if (!countryData) {
      return NextResponse.json(
        { error: "Quốc gia không hợp lệ" },
        { status: 400 }
      );
    }

    // Cập nhật rượu
    await connection.execute(
      `
      UPDATE Wines SET
        name = ?,
        wine_type_id = ?,
        country_id = ?,
        region = ?,
        year = ?,
        price = ?,
        original_price = ?,
        rating = ?,
        reviews = ?,
        description = ?,
        images = ?,
        in_stock = ?,
        featured = ?,
        alcohol = ?,
        volume = ?,
        winery = ?,
        serving_temp = ?
      WHERE id = ?
      `,
      [
        name,
        wineType.wine_type_id,
        countryData.country_id,
        region || null,
        year || null,
        price,
        originalPrice || null,
        rating || null,
        reviews || 0,
        description || null,
        JSON.stringify(images || []),
        inStock ?? true,
        featured ?? false,
        alcohol || null,
        volume || null,
        winery || null,
        servingTemp || null,
        params.id,
      ]
    );

    // Xóa quan hệ WineGrapes cũ
    await connection.execute("DELETE FROM WineGrapes WHERE wine_id = ?", [
      params.id,
    ]);

    // Thêm quan hệ WineGrapes mới
    if (grapes && Array.isArray(grapes) && grapes.length > 0) {
      for (const grape of grapes) {
        const [grapeRows] = await connection.execute(
          "SELECT grape_id FROM Grapes WHERE name = ?",
          [grape]
        );
        const grapeData = (grapeRows as any[])[0];
        if (grapeData) {
          await connection.execute(
            "INSERT INTO WineGrapes (wine_id, grape_id) VALUES (?, ?)",
            [params.id, grapeData.grape_id]
          );
        }
      }
    }

    // Xóa quan hệ WinePairings cũ
    await connection.execute("DELETE FROM WinePairings WHERE wine_id = ?", [
      params.id,
    ]);

    // Thêm quan hệ WinePairings mới
    if (pairings && Array.isArray(pairings) && pairings.length > 0) {
      for (const pairing of pairings) {
        const [pairingRows] = await connection.execute(
          "SELECT pairing_id FROM Pairings WHERE name = ?",
          [pairing]
        );
        const pairingData = (pairingRows as any[])[0];
        if (pairingData) {
          await connection.execute(
            "INSERT INTO WinePairings (wine_id, pairing_id) VALUES (?, ?)",
            [params.id, pairingData.pairing_id]
          );
        }
      }
    }

    return NextResponse.json({ message: "Cập nhật rượu thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật rượu:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể cập nhật rượu." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// Xóa rượu
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

    // Kiểm tra rượu tồn tại
    const [existingRows] = await connection.execute(
      "SELECT id FROM Wines WHERE id = ?",
      [params.id]
    );
    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy rượu" },
        { status: 404 }
      );
    }

    // Xóa quan hệ WineGrapes và WinePairings
    await connection.execute("DELETE FROM WineGrapes WHERE wine_id = ?", [
      params.id,
    ]);
    await connection.execute("DELETE FROM WinePairings WHERE wine_id = ?", [
      params.id,
    ]);

    // Xóa rượu
    await connection.execute("DELETE FROM Wines WHERE id = ?", [params.id]);

    return NextResponse.json({ message: "Xóa rượu thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa rượu:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Không thể xóa rượu." },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

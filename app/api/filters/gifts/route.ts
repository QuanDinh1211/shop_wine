import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

async function getConnection() {
  return mysql.createConnection(config);
}

export async function GET() {
  let connection;
  try {
    connection = await getConnection();

    const [themeRows] = await connection.execute(
      `SELECT DISTINCT theme FROM Gifts WHERE theme IS NOT NULL AND theme != '' ORDER BY theme`
    );
    const [priceRows] = await connection.execute(
      `SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM Gifts`
    );

    const themes: string[] = (themeRows as any[]).map((r) => String(r.theme));
    const min = (priceRows as any[])[0]?.minPrice
      ? parseFloat((priceRows as any[])[0].minPrice)
      : 0;
    const max = (priceRows as any[])[0]?.maxPrice
      ? parseFloat((priceRows as any[])[0].maxPrice)
      : 0;

    return NextResponse.json({
      giftTypes: ["set", "single", "combo"],
      themes,
      priceRange: { min, max },
    });
  } catch (error: any) {
    console.error("Lỗi lấy bộ lọc quà tặng:", error);
    return NextResponse.json(
      { error: "Không thể lấy bộ lọc quà tặng", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

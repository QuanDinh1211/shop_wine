import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

export async function GET() {
  try {
    const connection = await mysql.createConnection(config);
    const [wineTypes] = await connection.execute(
      "SELECT wine_type_id, name FROM WineTypes"
    );
    await connection.end();
    return NextResponse.json(wineTypes);
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách loại rượu:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

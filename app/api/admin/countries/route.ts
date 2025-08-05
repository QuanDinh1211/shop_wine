import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { config } from "@/config/db";

export async function GET() {
  try {
    const connection = await mysql.createConnection(config);
    const [countries] = await connection.execute(
      "SELECT country_id, name FROM Countries"
    );
    await connection.end();
    return NextResponse.json(countries);
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách quốc gia:", error);
    return NextResponse.json(
      { error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";
import { config } from "@/config/db";

export async function GET() {
  try {
    const connection = await mysql.createConnection(config);
    const [rows]: [Array<{ name: string } & RowDataPacket>, any] = await connection.execute(
      "SELECT DISTINCT name FROM Countries"
    );
    await connection.end();
    return NextResponse.json(rows.map((row) => row.name));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
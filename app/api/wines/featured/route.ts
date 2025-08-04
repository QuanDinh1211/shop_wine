import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { config } from '@/config/db';
import { Wine } from '@/lib/types';

// Define a type for the raw query result
interface WineRow extends RowDataPacket {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string | null;
  year: number | null;
  price: number;
  original_price: number | null;
  rating: number | null;
  reviews: number;
  description: string | null;
  images: string; // JSON string from database
  in_stock: boolean;
  featured: boolean;
  alcohol: number | null;
  volume: number | null;
  winery: string | null;
  serving_temp: string | null;
}

export async function GET() {
  try {
    const connection = await mysql.createConnection(config);

    // Fetch featured wines
    const [rows]: [WineRow[], any] = await connection.execute(`
      SELECT 
        w.id, 
        w.name, 
        wt.name AS type, 
        c.name AS country, 
        w.region, 
        w.year, 
        w.price, 
        w.original_price, 
        w.rating, 
        w.reviews, 
        w.description, 
        w.images, 
        w.in_stock, 
        w.featured, 
        w.alcohol, 
        w.volume, 
        w.winery, 
        w.serving_temp
      FROM Wines w
      JOIN WineTypes wt ON w.wine_type_id = wt.wine_type_id
      JOIN Countries c ON w.country_id = c.country_id
      WHERE w.featured = TRUE
    `);

    // Transform rows to Wine[] and fetch grapes and pairings
    const wines: Wine[] = await Promise.all(
      rows.map(async (row) => {
        // Fetch grapes
        const [grapes]: [Array<{ name: string } & RowDataPacket>, any] =
          await connection.execute(
            `
          SELECT g.name
          FROM WineGrapes wg
          JOIN Grapes g ON wg.grape_id = g.grape_id
          WHERE wg.wine_id = ?
        `,
            [row.id]
          );

        // Fetch pairings
        const [pairings]: [Array<{ name: string } & RowDataPacket>, any] =
          await connection.execute(
            `
          SELECT p.name
          FROM WinePairings wp
          JOIN Pairings p ON wp.pairing_id = p.pairing_id
          WHERE wp.wine_id = ?
        `,
            [row.id]
          );

        // Parse images from JSON string
        let images: string[] = [];

        if (typeof row.images === 'string') {
        try {
            images = JSON.parse(row.images);
        } catch {
            images = row.images.split(',').map(url => url.trim());
        }
        } else if (Array.isArray(row.images)) {
        images = row.images;
        }

        // Return Wine object
        return {
          id: row.id,
          name: row.name,
          type: row.type,
          country: row.country,
          region: row.region,
          year: row.year,
          price: row.price,
          originalPrice: row.original_price,
          rating: row.rating,
          reviews: row.reviews,
          description: row.description,
          images,
          inStock: row.in_stock,
          featured: row.featured,
          alcohol: row.alcohol,
          volume: row.volume,
          winery: row.winery,
          servingTemp: row.serving_temp,
          grapes: grapes.map((g) => g.name),
          pairings: pairings.map((p) => p.name),
        };
      })
    );

    await connection.end();
    return NextResponse.json(wines);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Lỗi server', error: error.message },
      { status: 500 }
    );
  }
}
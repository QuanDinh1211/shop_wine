import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { config } from '@/config/db';
import { Wine } from '@/lib/types';

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
  images: string;
  in_stock: boolean;
  featured: boolean;
  alcohol: number | null;
  volume: number | null;
  winery: string | null;
  serving_temp: string | null;
  wine_type_id: number;
  country_id: number;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await mysql.createConnection(config);

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
        w.serving_temp,
        w.wine_type_id,
        w.country_id
      FROM Wines w
      JOIN WineTypes wt ON w.wine_type_id = wt.wine_type_id
      JOIN Countries c ON w.country_id = c.country_id
      WHERE w.id = ?
    `, [params.id]);

    if (rows.length === 0) {
      await connection.end();
      return NextResponse.json(
        { message: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    const row = rows[0];

    const [grapes]: [Array<{ name: string } & RowDataPacket>, any] =
      await connection.execute(`
        SELECT g.name
        FROM WineGrapes wg
        JOIN Grapes g ON wg.grape_id = g.grape_id
        WHERE wg.wine_id = ?
      `, [row.id]);

    const [pairings]: [Array<{ name: string } & RowDataPacket>, any] =
      await connection.execute(`
        SELECT p.name
        FROM WinePairings wp
        JOIN Pairings p ON wp.pairing_id = p.pairing_id
        WHERE wp.wine_id = ?
      `, [row.id]);

    
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

    const wine: Wine = {
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

    const [relatedRows]: [WineRow[], any] = await connection.execute(`
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
      WHERE (w.wine_type_id = ? OR w.country_id = ?) AND w.id != ?
      LIMIT 3
    `, [row.wine_type_id, row.country_id, row.id]);

    const relatedWines: Wine[] = await Promise.all(
      relatedRows.map(async (relatedRow) => {
        const [relatedGrapes]: [Array<{ name: string } & RowDataPacket>, any] =
          await connection.execute(`
            SELECT g.name
            FROM WineGrapes wg
            JOIN Grapes g ON wg.grape_id = g.grape_id
            WHERE wg.wine_id = ?
          `, [relatedRow.id]);

        const [relatedPairings]: [Array<{ name: string } & RowDataPacket>, any] =
          await connection.execute(`
            SELECT p.name
            FROM WinePairings wp
            JOIN Pairings p ON wp.pairing_id = p.pairing_id
            WHERE wp.wine_id = ?
          `, [relatedRow.id]);

        let images: string[] = [];

        if (typeof relatedRow.images === 'string') {
        try {
            images = JSON.parse(relatedRow.images);
        } catch {
            images = relatedRow.images.split(',').map(url => url.trim());
        }
        } else if (Array.isArray(relatedRow.images)) {
        images = relatedRow.images;
        }

        return {
          id: relatedRow.id,
          name: relatedRow.name,
          type: relatedRow.type,
          country: relatedRow.country,
          region: relatedRow.region,
          year: relatedRow.year,
          price: relatedRow.price,
          originalPrice: row.original_price,
          rating: relatedRow.rating,
          reviews: relatedRow.reviews,
          description: relatedRow.description,
          images: images,
          inStock: relatedRow.in_stock,
          featured: relatedRow.featured,
          alcohol: relatedRow.alcohol,
          volume: relatedRow.volume,
          winery: relatedRow.winery,
          servingTemp: relatedRow.serving_temp,
          grapes: relatedGrapes.map((g) => g.name),
          pairings: relatedPairings.map((p) => p.name),
        };
      })
    );

    await connection.end();
    return NextResponse.json({ wine, relatedWines });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Lỗi server', error: error.message },
      { status: 500 }
    );
  }
}


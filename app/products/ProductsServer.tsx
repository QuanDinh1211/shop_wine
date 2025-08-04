import { Wine } from "@/lib/types";

export default async function ProductsServer() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/wines/all`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return { wines: [] };
    }
    const data: Wine[] = await res.json();
    return { wines: data };
  } catch (err: any) {
    return { wines: [] };
  }
}

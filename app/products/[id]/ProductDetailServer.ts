import { Wine } from "@/lib/types";

export default async function ProductDetailServer(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/wines/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return { data: null };
    }
    const data: Wine = await res.json();
    return { data: data };
  } catch (err: any) {
    return { data: null };
  }
}

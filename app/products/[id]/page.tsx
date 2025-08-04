import { Wine } from "@/lib/types";
import ProductPage from "./ProductPage";

export default function Page({ params }: { params: { id: string } }) {
  return <ProductPage id={params.id} />;
}
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/wines/featured`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return [];
    }
    const data: Wine[] = await res.json();
    return data.map((wine) => ({
      id: wine.id,
    }));
  } catch (err: any) {
    return [];
  }
}

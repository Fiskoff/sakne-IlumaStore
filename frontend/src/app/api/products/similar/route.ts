// app/api/products/similar/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "4", 10);

  if (!productId || !category) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/products/${category}`);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const allProducts = await response.json();

    // 🔹 Фильтруем товары по наличию и исключаем текущий
    const availableProducts = allProducts.filter(
      (product: any) => product.id !== productId && product.nalichie
    );

    // Случайная сортировка и лимит
    const similarProducts = availableProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.variants?.[0]?.price || product.price,
        imageUrl: product.variants?.[0]?.imageUrl || product.imageUrl,
        url: `/product/${product.ref || product.id}`,
        description: product.description,
        variants: product.variants,
        nalichie: product.nalichie, // добавляем наличие
      }));

    return NextResponse.json(similarProducts);
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

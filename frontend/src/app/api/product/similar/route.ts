// app/api/product/similar/route.ts
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
    const baseUrl = "http://localhost:3001";

    // 🔥 ИСПРАВЛЕНИЕ: Используем новый categories API вместо product API
    const response = await fetch(`${baseUrl}/api/categories/${category}`);

    if (!response.ok) {
      throw new Error("Failed to fetch products from categories API");
    }

    const allProducts = await response.json();

    // 🔹 Фильтруем товары по наличию и исключаем текущий
    const availableProducts = allProducts.filter(
      (product: any) =>
        product.id.toString() !== productId.toString() && product.nalichie
    );

    // Случайная сортировка и лимит
    const similarProducts = availableProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.variants?.[0]?.price || product.priceValue || 0,
        imageUrl: product.variants?.[0]?.imageUrl || product.image,
        url: `/product/${product.ref || product.id}`,
        description: product.description,
        variants: product.variants,
        nalichie: product.nalichie,
      }));

    return NextResponse.json(similarProducts);
  } catch (error) {
    console.error("❌ [SIMILAR API] Error fetching similar products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

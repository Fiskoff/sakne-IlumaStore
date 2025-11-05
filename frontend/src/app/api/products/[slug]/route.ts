import { NextResponse } from "next/server";

const validCategories = ["terea", "iqos", "devices"] as const;

async function getAllProducts() {
  const endpoints = [
    "http://127.0.0.1:8000/products/devices",
    "http://127.0.0.1:8000/products/iqos",
    "http://127.0.0.1:8000/products/terea",
  ];

  try {
    const allProducts = [];

    for (const endpoint of endpoints) {
      let skip = 0;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const url = `${endpoint}?skip=${skip}&limit=${limit}`;
        const res = await fetch(url.trim());

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        // Определяем ключ категории с проверкой на undefined
        const category = Object.keys(data).find(
          (key) =>
            Array.isArray(data[key]) &&
            key !== "skip" &&
            key !== "limit" &&
            key !== "total"
        );

        // Добавляем проверку на существование category
        if (category && data[category] && Array.isArray(data[category])) {
          allProducts.push(...data[category]);
        }

        // Проверяем, есть ли еще данные
        if (category && data[category] && data[category].length < limit) {
          hasMore = false;
        } else {
          skip += limit;
        }

        // Добавляем задержку чтобы не перегружать API
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return allProducts;
  } catch (err) {
    console.error("Error fetching all products:", err);
    return [];
  }
}

async function getProductsByCategory(category: string) {
  if (!validCategories.includes(category as any)) category = "terea";

  try {
    const allProducts = [];
    let skip = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const apiUrl = `http://127.0.0.1:8000/products/${category}?skip=${skip}&limit=${limit}`;
      const res = await fetch(apiUrl.trim());

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      // Безопасное получение массива продуктов
      const products = (data[category] || []) as any[];
      allProducts.push(...products.map(formatProduct));

      // Проверяем, есть ли еще данные
      if (products.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }

      // Небольшая задержка
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return allProducts;
  } catch (err) {
    console.error(`Error fetching category ${category}:`, err);
    throw new Error("Не удалось получить данные");
  }
}

// Проверка наличия
function getStockStatus(product: any): boolean {
  const stock = product.nalichie;
  if (stock === undefined || stock === null) return false;
  if (typeof stock === "number") return stock === 1;
  if (typeof stock === "boolean") return stock;
  if (typeof stock === "string") {
    const num = Number(stock);
    if (!isNaN(num)) return num === 1;
    return ["да", "есть", "true", "1", "available", "in stock", "yes"].includes(
      stock.toLowerCase().trim()
    );
  }
  return false;
}

export function formatProduct(product: any) {
  const inStock = getStockStatus(product);

  let variants = [];

  if (product.type === "terea" && product.imagePack) {
    variants = [
      {
        type: "pack" as const,
        imageUrl: product.imagePack,
        price: Number(product.pricePack ?? product.price),
        name: `${product.name} (пачка)`,
        nalichie: inStock,
      },
      {
        type: "block" as const,
        imageUrl: product.image,
        price: Number(product.price),
        name: `${product.name} (блок)`,
        nalichie: inStock,
      },
    ];
  } else {
    variants = [
      {
        type: "pack" as const,
        imageUrl: product.image,
        price: Number(product.price),
        name: product.name,
        nalichie: inStock,
      },
    ];
  }

  return { ...product, variants, nalichie: inStock };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Проверяем, является ли slug валидной категорией
  if (validCategories.includes(slug as any)) {
    try {
      const products = await getProductsByCategory(slug);
      return NextResponse.json(products);
    } catch (err) {
      return NextResponse.json(
        { error: "Ошибка при загрузке данных" },
        { status: 500 }
      );
    }
  }

  try {
    const allProducts = await getAllProducts();

    const product =
      allProducts.find(
        (p: any) => p.ref && p.ref.toLowerCase() === slug.toLowerCase()
      ) || allProducts.find((p: any) => p.id?.toString() === slug);

    if (!product)
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });

    return NextResponse.json(formatProduct(product));
  } catch (err) {
    console.error("Error in product API:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

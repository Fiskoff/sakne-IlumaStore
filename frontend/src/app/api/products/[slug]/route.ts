import { NextResponse } from "next/server";

const validCategories = ["terea", "iqos", "devices"] as const;

// Получение всех товаров
async function getAllProducts() {
  const endpoints = [
    "http://127.0.0.1:8000/products/devices",
    "http://127.0.0.1:8000/products/iqos",
    "http://127.0.0.1:8000/products/terea",
  ];

  try {
    const responses = await Promise.all(
      endpoints.map((url) => fetch(url.trim()))
    );
    const dataArrays = await Promise.all(responses.map((res) => res.json()));

    return dataArrays.flatMap((obj) => {
      const key = Object.keys(obj)[0];
      return obj[key as keyof typeof obj] ?? [];
    });
  } catch (err) {
    console.error("Error fetching all products:", err);
    return [];
  }
}

// Получение товаров по категории
async function getProductsByCategory(category: string) {
  if (!validCategories.includes(category as any)) category = "terea";

  const apiUrl = `http://127.0.0.1:8000/products/${category}`;

  try {
    const res = await fetch(apiUrl.trim());
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return (data[category] ?? []).map(formatProduct); // форматируем сразу
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

// Форматирование продукта и вариантов
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

// GET-роут
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Если slug — категория
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

  // Если slug — ref или id товара
  try {
    const allProducts = await getAllProducts();

    const product =
      allProducts.find(
        (p) => p.ref && p.ref.toLowerCase() === slug.toLowerCase()
      ) || allProducts.find((p) => p.id?.toString() === slug);

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

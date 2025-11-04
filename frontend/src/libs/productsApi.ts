// lib/productsApi.ts

const validCategories = ["terea", "iqos", "devices"] as const;

// Правильная функция проверки наличия
export function getStockStatus(product: any, variantType?: string): boolean {
  if (!product) return false;

  // Если указан тип варианта, ищем наличие в варианте
  if (variantType && product.variants) {
    const variant = product.variants.find((v: any) => v.type === variantType);
    if (variant && variant.nalichie !== undefined) {
      return Boolean(variant.nalichie);
    }
  }

  // Если вариант не найден или не указан, используем общее наличие товара
  return Boolean(product.nalichie);
}

export function formatProduct(product: any) {
  // Для основного товара используем общее наличие
  const inStock = Boolean(product.nalichie);

  let variants = [];

  if (product.type === "terea" && product.imagePack) {
    variants = [
      {
        type: "pack" as const,
        imageUrl: product.imagePack,
        price: Number(product.pricePack ?? product.price),
        name: `${product.name} (пачка)`,
        nalichie: getStockStatus(product, "pack"), // Отдельная проверка для пачки
      },
      {
        type: "block" as const,
        imageUrl: product.image,
        price: Number(product.price),
        name: `${product.name} (блок)`,
        nalichie: getStockStatus(product, "block"), // Отдельная проверка для блока
      },
    ];
  } else {
    variants = [
      {
        type: "pack" as const,
        imageUrl: product.image,
        price: Number(product.price),
        name: product.name,
        nalichie: inStock, // Используем общее наличие
      },
    ];
  }

  return { ...product, variants, nalichie: inStock };
}

// Получаем все товары из всех категорий (для поиска по ref/id)
export async function getAllProducts() {
  const endpoints = [
    "http://127.0.0.1:8000/products/devices",
    "http://127.0.0.1:8000/products/iqos",
    "http://127.0.0.1:8000/products/terea",
  ];

  const allProducts: any[] = [];

  for (const endpoint of endpoints) {
    let skip = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      try {
        const res = await fetch(`${endpoint}?skip=${skip}&limit=${limit}`);
        if (!res.ok) {
          console.warn(`Failed to fetch from ${endpoint}: ${res.status}`);
          break;
        }

        const data = await res.json();

        // Находим ключ категории в ответе
        const categoryKey = Object.keys(data).find(
          (key) =>
            Array.isArray(data[key]) &&
            !["skip", "limit", "total"].includes(key)
        );

        if (categoryKey && Array.isArray(data[categoryKey])) {
          const formattedProducts = data[categoryKey].map(formatProduct);
          allProducts.push(...formattedProducts);

          if (data[categoryKey].length < limit) {
            hasMore = false;
          } else {
            skip += limit;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        hasMore = false;
      }
    }
  }

  console.log(`Loaded ${allProducts.length} products total`);
  return allProducts;
}

// Получаем товары по конкретной категории
export async function getProductsByCategory(category: string) {
  if (!validCategories.includes(category as any)) category = "terea";

  const allProducts: any[] = [];
  let skip = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/products/${category}?skip=${skip}&limit=${limit}`
      );
      if (!res.ok) {
        console.warn(`Failed to fetch ${category}: ${res.status}`);
        break;
      }

      const data = await res.json();
      const products = Array.isArray(data[category]) ? data[category] : [];
      const formattedProducts = products.map(formatProduct);
      allProducts.push(...formattedProducts);

      if (products.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      hasMore = false;
    }
  }

  console.log(`Loaded ${allProducts.length} products for category ${category}`);
  return allProducts;
}

// app/api/product/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";

const validCategories = ["terea", "iqos", "devices"] as const;

// Кэш для категорий (в памяти)
const categoryCache = new Map();
const productCache = new Map();

// Вспомогательные функции для работы со складом
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

// Функция форматирования продукта
function formatProduct(product: any) {
  const inStock = getStockStatus(product);

  // 🔹 ЕДИНООБРАЗНОЕ ПРЕОБРАЗОВАНИЕ ВСЕХ ЦЕН
  const safePriceValue = product.price ? Number(product.price.toString()) : 0;
  const safePricePackValue = product.pricePack
    ? Number(product.pricePack.toString())
    : 0;

  console.log("🔍 Formatting product:", {
    name: product.name,
    originalPrice: product.price,
    originalPriceType: typeof product.price,
    convertedPrice: safePriceValue,
    convertedPriceType: typeof safePriceValue,
  });

  let variants = [];

  if (product.type === "terea" && product.imagePack) {
    variants = [
      {
        type: "pack" as const,
        imageUrl: product.imagePack,
        price: safePricePackValue || safePriceValue || 0, // 🔹 Используем безопасное значение
        name: `${product.name} (пачка)`,
        nalichie: inStock,
      },
      {
        type: "block" as const,
        imageUrl: product.image,
        price: safePriceValue || 0, // 🔹 Используем безопасное значение
        name: `${product.name} (блок)`,
        nalichie: inStock,
      },
    ];
  } else {
    variants = [
      {
        type: "pack" as const,
        imageUrl: product.image,
        price: safePriceValue || 0, // 🔹 Используем безопасное значение
        name: product.name,
        nalichie: inStock,
      },
    ];
  }

  let flavorNormalized: string[] = [];
  if (product.flavor) {
    if (Array.isArray(product.flavor)) {
      flavorNormalized = product.flavor.map((f: any) =>
        String(f).toLowerCase().trim()
      );
    } else if (typeof product.flavor === "string") {
      flavorNormalized = product.flavor
        .split(/[,/|]/)
        .map((f: string) => f.toLowerCase().trim())
        .filter((f: string) => f.length > 0);
    }
  }

  return {
    ...product,
    variants,
    priceValue: safePriceValue, // 🔹 Единообразно
    nalichie: inStock,
    pricePackValue: safePricePackValue, // 🔹 Единообразно
    flavorNormalized,
  };
}

// Функция получения продуктов по категории (оптимизированная)
async function getProductsByCategory(category: string) {
  if (!validCategories.includes(category as any)) {
    category = "terea";
  }

  // Проверяем кэш
  const cacheKey = `category_${category}`;
  if (categoryCache.has(cacheKey)) {
    console.log(`📦 Using cached category: ${category}`);
    return categoryCache.get(cacheKey);
  }

  try {
    console.log(`🚀 Fetching category: ${category}`);

    // Получаем ВСЕ продукты за один запрос
    const apiUrl = `http://217.198.9.128:8000/products/${category}?limit=1000`;
    console.log(`📦 Fetching from external API: ${apiUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(apiUrl.trim(), {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`External API error: ${res.status}`);
    const data = await res.json();

    // Безопасное получение массива продуктов
    const products = (data[category] || data.products || []) as any[];
    console.log(`✅ Fetched ${products.length} products for ${category}`);

    const formattedProducts = products.map(formatProduct);

    // Сохраняем в кэш на 2 минуты
    categoryCache.set(cacheKey, formattedProducts);
    setTimeout(() => {
      categoryCache.delete(cacheKey);
    }, 120000);

    return formattedProducts;
  } catch (err) {
    console.error(`❌ Error fetching category ${category}:`, err);
    // Если ошибка, возвращаем пустой массив вместо выброса ошибки
    return [];
  }
}

// Функция для безопасного сравнения значений
function safeCompare(productValue: any, filterValue: any): boolean {
  if (productValue == null || filterValue == null) return false;

  // Приводим productValue к строке
  const productStr = String(productValue).toLowerCase().trim();

  // Обрабатываем разные типы filterValue
  if (Array.isArray(filterValue)) {
    // Если фильтр - массив (мультиселект)
    return filterValue.some((filterItem: any) => {
      if (filterItem == null) return false;
      const filterStr = String(filterItem).toLowerCase().trim();
      return productStr === filterStr;
    });
  } else if (typeof filterValue === "object") {
    // Если фильтр - объект (например, для диапазона цены)
    console.warn(
      "Object filter value not handled in safeCompare:",
      filterValue
    );
    return false;
  } else {
    // Если фильтр - одиночное значение
    const filterStr = String(filterValue).toLowerCase().trim();
    return productStr === filterStr;
  }
}

// 🔹 ИСПРАВЛЕННАЯ функция фильтрации для price
function filterProductsOnServer(
  products: any[],
  filters: any,
  category: string
) {
  let filtered = products.filter((p) => p.nalichie);

  console.log("🔍 Filtering products with filters:", filters);
  console.log(`📊 Starting with ${filtered.length} available products`);

  const priceTypes = products.map((p) => ({
    name: p.name,
    priceValue: p.priceValue,
    priceValueType: typeof p.priceValue,
    priceOriginal: p.price,
    priceOriginalType: typeof p.price,
  }));
  console.log("💰 Price types check:", priceTypes);

  Object.entries(filters).forEach(([key, value]) => {
    if (key === "sort" || key === "page" || value == null) return;

    filtered = filtered.filter((product) => {
      try {
        switch (key) {
          case "price":
            if (value && typeof value === "object") {
              const productPrice = product.priceValue ?? 0;
              const priceFilter = value as { min?: number; max?: number };

              // 🔹 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ДЛЯ ВЫСОКИХ ЦЕН
              if (productPrice >= 30000) {
                console.log(
                  `🔍 HIGH PRICE CHECK: "${product.name}" price ${productPrice} vs filter [${priceFilter.min}, ${priceFilter.max}]`
                );
              }

              if (
                priceFilter.min !== undefined &&
                productPrice < priceFilter.min
              ) {
                console.log(
                  `❌ ${product.name} filtered out - price ${productPrice} < min ${priceFilter.min}`
                );
                return false;
              }
              if (
                priceFilter.max !== undefined &&
                productPrice > priceFilter.max
              ) {
                console.log(
                  `❌ ${product.name} filtered out - price ${productPrice} > max ${priceFilter.max}`
                );
                return false;
              }

              if (productPrice >= 30000) {
                console.log(
                  `✅ HIGH PRICE PASSED: ${product.name} price ${productPrice} in range [${priceFilter.min}, ${priceFilter.max}]`
                );
              }
              return true;
            }
            return true;

          // 🔹 ДОБАВЛЕНА обработка отдельных minPrice и maxPrice
          case "minPrice":
            // 🔹 Безопасное преобразование значения
            let minPrice: number;
            if (typeof value === "string") {
              minPrice = parseFloat(value);
            } else if (typeof value === "number") {
              minPrice = value;
            } else {
              // Если value - объект или другой тип, пропускаем фильтр
              console.warn(
                `⚠️ minPrice has unexpected type: ${typeof value}`,
                value
              );
              return true;
            }

            if (!isNaN(minPrice)) {
              const productPrice = product.priceValue ?? 0;
              if (productPrice < minPrice) {
                console.log(
                  `❌ ${product.name} filtered out - price ${productPrice} < min ${minPrice}`
                );
                return false;
              }
              console.log(
                `✅ ${product.name} passed minPrice filter: ${productPrice} >= ${minPrice}`
              );
            }
            return true;

          case "maxPrice":
            // 🔹 Безопасное преобразование значения
            let maxPrice: number;
            if (typeof value === "string") {
              maxPrice = parseFloat(value);
            } else if (typeof value === "number") {
              maxPrice = value;
            } else {
              // Если value - объект или другой тип, пропускаем фильтр
              console.warn(
                `⚠️ maxPrice has unexpected type: ${typeof value}`,
                value
              );
              return true;
            }

            if (!isNaN(maxPrice)) {
              const productPrice = product.priceValue ?? 0;
              if (productPrice > maxPrice) {
                console.log(
                  `❌ ${product.name} filtered out - price ${productPrice} > max ${maxPrice}`
                );
                return false;
              }
              console.log(
                `✅ ${product.name} passed maxPrice filter: ${productPrice} <= ${maxPrice}`
              );
            }
            return true;

          case "package_type":
            if (category === "terea") {
              if (value === "pack") {
                return product.variants?.some((v: any) => v.type === "pack");
              } else if (value === "block") {
                return product.variants?.some((v: any) => v.type === "block");
              }
            }
            return true;

          case "brand":
            if (category === "iqos" || category === "devices") {
              const productBrand = product.category?.category_name;
              return safeCompare(productBrand, value);
            }
            return true;

          case "country":
            if (category === "terea") {
              const productCountry = product.country;
              return safeCompare(productCountry, value);
            }
            return true;

          case "color":
            const productColor = product.color;
            return safeCompare(productColor, value);

          case "flavor":
            if (category === "terea") {
              const productFlavors = product.flavorNormalized || [];
              if (Array.isArray(value)) {
                return value.some((selectedFlavor: string) => {
                  const normalizedSelected = selectedFlavor
                    .toLowerCase()
                    .trim();
                  return productFlavors.some(
                    (productFlavor: string) =>
                      productFlavor.includes(normalizedSelected) ||
                      normalizedSelected.includes(productFlavor)
                  );
                });
              } else if (typeof value === "string") {
                const normalizedSelected = value.toLowerCase().trim();
                return productFlavors.some(
                  (productFlavor: string) =>
                    productFlavor.includes(normalizedSelected) ||
                    normalizedSelected.includes(productFlavor)
                );
              }
            }
            return true;

          case "search":
            if (!value) return true;
            const searchTerm = String(value).toLowerCase();
            return (
              product.name?.toLowerCase().includes(searchTerm) ||
              product.description?.toLowerCase().includes(searchTerm) ||
              product.country?.toLowerCase().includes(searchTerm) ||
              product.brend?.toLowerCase().includes(searchTerm) ||
              product.category?.category_name
                ?.toLowerCase()
                .includes(searchTerm) ||
              product.flavor?.toLowerCase().includes(searchTerm)
            );

          default:
            return true;
        }
      } catch (error) {
        console.error(`❌ Error applying filter ${key}:`, error);
        console.error(`Product:`, product);
        return true;
      }
    });
  });

  console.log(
    `✅ After filtering: ${filtered.length} products out of ${products.length}`
  );
  return filtered;
}

// Функция сортировки на сервере
function sortProductsOnServer(products: any[], sortBy: string) {
  if (!sortBy) return products;

  const sorted = [...products];
  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
    case "price-desc":
      return sorted.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
    case "name-asc":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    case "name-desc":
      return sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    default:
      return sorted;
  }
}

// 🔹 ИСПРАВЛЕННАЯ основная функция обработки запросов
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Если это категория, сразу обрабатываем
    if (validCategories.includes(slug as any)) {
      const category = slug;
      const { searchParams } = new URL(req.url);
      const filters: any = {};

      console.log(
        "🔍 Raw search parameters:",
        Object.fromEntries(searchParams.entries())
      );

      // 🔹 УЛУЧШЕННЫЙ парсинг параметров фильтрации
      searchParams.forEach((value, key) => {
        if (key !== "page" && key !== "perPage") {
          try {
            console.log(`📊 Processing parameter: ${key} = ${value}`);

            // 🔹 ОСОБАЯ ОБРАБОТКА ДЛЯ PRICE ПАРАМЕТРА
            if (key === "price") {
              try {
                // Пробуем декодировать URL-encoded JSON
                const decodedValue = decodeURIComponent(value);
                console.log(`💰 Decoded price value: ${decodedValue}`);

                const parsedPrice = JSON.parse(decodedValue);
                if (parsedPrice && typeof parsedPrice === "object") {
                  filters[key] = {
                    min:
                      parsedPrice.min !== undefined
                        ? Number(parsedPrice.min)
                        : 0,
                    max:
                      parsedPrice.max !== undefined
                        ? Number(parsedPrice.max)
                        : 10000,
                  };
                  console.log(`✅ Successfully parsed price:`, filters[key]);
                }
              } catch (parseError) {
                console.error(
                  `❌ Failed to parse price parameter:`,
                  value,
                  parseError
                );
              }
              return; // переходим к следующему параметру
            }

            // Декодируем URL-encoded строку для остальных параметров
            const decodedValue = decodeURIComponent(value);

            // Для параметров с запятыми создаем массив
            if (decodedValue.includes(",")) {
              filters[key] = decodedValue
                .split(",")
                .map((v: string) => v.trim());
            } else {
              // Пробуем распарсить как JSON для объектов
              try {
                const parsed = JSON.parse(decodedValue);
                filters[key] = parsed;
              } catch (jsonError) {
                // Если не JSON, используем как строку
                filters[key] = decodedValue;
              }
            }
          } catch (error) {
            console.error(`❌ Error parsing parameter ${key}:`, error);
            filters[key] = value;
          }
        }
      });

      console.log("🎯 Final filters object:", filters);

      // 🔹 ДОБАВЛЕНО: Преобразуем minPrice/maxPrice в единый price объект для совместимости
      // if (
      //   (filters.minPrice !== undefined || filters.maxPrice !== undefined) &&
      //   !filters.price
      // ) {
      //   filters.price = {
      //     min: filters.minPrice !== undefined ? Number(filters.minPrice) : 0,
      //     max:
      //       filters.maxPrice !== undefined ? Number(filters.maxPrice) : 10000,
      //   };
      //   console.log(
      //     "🔄 Converted minPrice/maxPrice to price object:",
      //     filters.price
      //   );

      //   // Удаляем отдельные параметры чтобы не мешали
      //   delete filters.minPrice;
      //   delete filters.maxPrice;
      // }

      // Получаем все продукты категории
      const allProducts = await getProductsByCategory(category);

      if (!allProducts || !Array.isArray(allProducts)) {
        throw new Error("Failed to fetch products");
      }

      console.log(`📦 Total products fetched: ${allProducts.length}`);

      // 🔹 ДЕБАГ: Выводим цены продуктов для проверки
      const prices = allProducts.map((p) => p.priceValue).filter(Boolean);
      if (prices.length > 0) {
        console.log("💰 Product prices range:", {
          min: Math.min(...prices),
          max: Math.max(...prices),
          count: prices.length,
        });
      }

      // Применяем фильтрацию на сервере
      const filteredProducts = filterProductsOnServer(
        allProducts,
        filters,
        category
      );

      // Применяем сортировку на сервере
      const sortedProducts = sortProductsOnServer(
        filteredProducts,
        filters.sort
      );

      // Пагинация
      const page = parseInt(searchParams.get("page") || "1");
      const perPage = parseInt(searchParams.get("perPage") || "12");
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

      console.log(
        `✅ Returning ${paginatedProducts.length} products out of ${sortedProducts.length} total for category ${category}`
      );

      return NextResponse.json({
        products: paginatedProducts,
        total: sortedProducts.length,
        page,
        totalPages: Math.ceil(sortedProducts.length / perPage),
        hasMore: endIndex < sortedProducts.length,
      });
    }

    // Если не категория, ищем продукт
    console.log(`🔍 Treating slug as product ref: "${slug}"`);
    const productByRef = await getProductByRef(slug);

    if (productByRef) {
      return NextResponse.json(productByRef);
    }

    // 🔥 Если не нашли ни продукт, ни категорию
    return NextResponse.json(
      { error: "Товар или категория не найдены" },
      { status: 404 }
    );
  } catch (error) {
    console.error("❌ Error in API route:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Функция для поиска продукта по ref (оптимизированная)
async function getProductByRef(ref: string) {
  const cacheKey = `product_${ref}`;
  if (productCache.has(cacheKey)) {
    console.log(`📦 Using cached product: ${ref}`);
    return productCache.get(cacheKey);
  }

  try {
    console.log(`🔍 Starting search for product by ref: "${ref}"`);

    // Параллельно ищем во всех категориях
    const categories = ["terea", "iqos", "devices"];
    const promises = categories.map((category) =>
      getProductsByCategory(category)
    );

    const allProductsArrays = await Promise.allSettled(promises);
    const allProducts = allProductsArrays
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => (result as PromiseFulfilledResult<any[]>).value);

    // Ищем продукт
    const product = allProducts.find((p: any) => {
      const matchByRef = p.ref?.toLowerCase() === ref.toLowerCase();
      const matchById = p.id?.toString() === ref;
      const matchBySlug =
        p.name
          ?.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "") === ref.toLowerCase();

      return matchByRef || matchById || matchBySlug;
    });

    if (product) {
      // Сохраняем в кэш на 5 минут
      productCache.set(cacheKey, product);
      setTimeout(() => {
        productCache.delete(cacheKey);
      }, 300000);

      return product;
    }

    console.log(`❌ Product not found: "${ref}"`);
    return null;
  } catch (error) {
    console.error("❌ Error in getProductByRef:", error);
    return null;
  }
}

// Обработка других HTTP методов
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT(req: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

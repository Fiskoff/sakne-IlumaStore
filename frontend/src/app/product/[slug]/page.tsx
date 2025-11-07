// app/product/[slug]/page.tsx
import { Metadata } from "next";
import ProductPage from "@/components/product/productPage/productPage";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductData(slug: string) {
  try {
    // 🔥 ИСПРАВЛЕНИЕ: Правильное формирование URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3020";
    const apiUrl = `${baseUrl}/api/product/${encodeURIComponent(slug)}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const product = await response.json();

    // Проверяем, не вернул ли API ошибку в JSON
    if (product.error) {
      return null;
    }

    // 🔥 ДОБАВЛЕНО: Проверяем, что продукт действительно найден
    if (!product || !product.id) {
      return null;
    }

    return product;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  console.log("📄 Generate metadata for slug:", slug);

  const product = await getProductData(slug);

  if (!product) {
    return {
      title: "Товар не найден | Iluma-Store",
      description: "Запрашиваемый товар не найден в каталоге Iluma-Store",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  // Определяем категорию продукта для ключевых слов
  const getProductCategory = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes("terea") || name.includes("стик")) return "стики TEREA";
    if (name.includes("iluma") || name.includes("iqos"))
      return "устройства IQOS Iluma";
    if (
      name.includes("чехол") ||
      name.includes("заряд") ||
      name.includes("очиститель")
    )
      return "аксессуары для IQOS";
    return "товары для нагрева табака";
  };

  const productCategory = getProductCategory(product.name);
  const priceText = product.price
    ? ` по цене ${product.price.toLocaleString("ru-RU")} руб.`
    : "";

  return {
    title: `${product.name} - купить в Москве${priceText} | Iluma-Store`,
    description: `${product.name} - ${
      product.description ||
      `Оригинальные ${productCategory}. Доставка по Москве и России. Гарантия качества.`
    }`,
    keywords: `купить ${product.name}, ${productCategory}, ${
      product.name
    } цена, оригинальные ${productCategory.toLowerCase()}, доставка ${
      product.name
    }`,
    openGraph: {
      title: `${product.name} | Iluma-Store`,
      description: `${product.name} - ${
        product.description ||
        `Оригинальные ${productCategory}. Доставка по Москве и России.`
      }`,
      type: "website", // 🔥 ИСПРАВЛЕНИЕ: используем "website" вместо "product"
      url: `https://iluma-store.ru/product/${slug}`,
      siteName: "Iluma-Store",
      images: [
        {
          url:
            product.image ||
            product.imageUrl ||
            product.variants?.[0]?.imageUrl ||
            "/og-product-image.jpg",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Iluma-Store`,
      description: `${product.name} - ${
        product.description || `Оригинальные ${productCategory}`
      }`,
      images: [
        product.image ||
          product.imageUrl ||
          product.variants?.[0]?.imageUrl ||
          "/twitter-product-image.jpg",
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://iluma-store.ru/product/${slug}`,
    },
    // 🔥 ИСПРАВЛЕНИЕ: Убираем некорректные product теги или используем правильный формат
    // other: {
    //   "product:price:amount": product.price?.toString() || "",
    //   "product:price:currency": "RUB",
    //   "product:availability": product.variants?.some((v: any) => v.nalichie)
    //     ? "in stock"
    //     : "out of stock",
    // },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  console.log("🚀 Product page loading for slug:", slug);

  const product = await getProductData(slug);

  console.log("📊 Product data check:", {
    hasProduct: !!product,
    productName: product?.name,
    productId: product?.id,
    productRef: product?.ref,
  });

  if (!product) {
    console.log("❌ Product not found, showing 404");
    notFound();
  }

  console.log("🎨 Rendering product page for:", product.name);
  return <ProductPage product={product} />;
}

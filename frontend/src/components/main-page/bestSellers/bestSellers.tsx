import ProductCard from "@/components/ui/productCard/productCard";
import styles from "./bestSellers.module.scss";
import Script from "next/script";

interface PageProps {
  title?: string;
  limit?: number;
}

interface Variant {
  type: "pack" | "block";
  imageUrl: string;
  price: number;
  name: string;
  nalichie?: boolean;
}

interface Product {
  id: number;
  name: string;
  ref: string;
  description: string;
  type: "iqos" | "terea" | "devices";
  price: number;
  nalichie: boolean;
  hit: number;
  variants: Variant[];
  url?: string;
}

export default async function BestSellers({ title, limit }: PageProps) {
  const categories = ["terea", "iqos"];
  let allData: Product[] = [];

  for (const category of categories) {
    try {
      const apiUrl = `http://217.198.9.128:3001/api/product/${category}`;

      const res = await fetch(apiUrl, {
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        console.warn(
          `Ошибка HTTP для ${category}:`,
          res.status,
          res.statusText
        );
        continue;
      }

      const response = await res.json();

      // Обрабатываем разные форматы ответа
      let data: Product[] = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (response.products && Array.isArray(response.products)) {
        data = response.products;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else {
        console.warn(`Неизвестный формат данных для ${category}:`, response);
        continue;
      }

      // Фильтруем товары с hit=1 и проверяем наличие
      let hitItems = data.filter((item) => {
        const isHit = Number(item.hit) === 1;
        const isAvailable = item.nalichie === true;

        return isHit && isAvailable;
      });

      // Если нет хитов, берем первые доступные товары
      if (hitItems.length === 0) {
        hitItems = data.filter((item) => item.nalichie === true).slice(0, 6); // Ограничиваем количество
      }

      allData.push(...hitItems);
    } catch (error) {
      console.error(
        `Критическая ошибка при загрузке категории ${category}:`,
        error
      );
    }
  }

  // Сортировка по названию
  allData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const displayedProducts = limit ? allData.slice(0, limit) : allData;

  return (
    <section className="container" aria-label="Хиты продаж IQOS ILUMA и TEREA">
      <div className={styles.header}>
        <h2>{title}</h2>
        {/* Отладочная информация */}
        <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Найдено товаров: {displayedProducts.length} | Категории:{" "}
          {categories.join(", ")}
        </div>
      </div>

      {displayedProducts.length > 0 ? (
        <div className={styles.grid}>
          {displayedProducts.map((product, index) => (
            <article
              key={`${product.id}-${index}`}
              className={styles.product_wrapper}
            >
              <ProductCard
                id={String(product.id)}
                variants={product.variants || []}
                url={`/product/${product.ref}`}
                description={product.description}
              />

              <Script
                id={`product-jsonld-${product.id}-${index}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: product.name,
                    image: (product.variants || [])
                      .map((v) => v.imageUrl)
                      .filter(Boolean),
                    description: product.description,
                    brand: {
                      "@type": "Brand",
                      name: product.type === "iqos" ? "IQOS" : "TEREA",
                    },
                    offers: (product.variants || []).map((v) => ({
                      "@type": "Offer",
                      price: v.price,
                      priceCurrency: "RUB",
                      availability: v.nalichie
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",
                      url: `/product/${product.ref}`,
                    })),
                  }),
                }}
              />
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Пока нет хитов продаж</p>
        </div>
      )}
    </section>
  );
}

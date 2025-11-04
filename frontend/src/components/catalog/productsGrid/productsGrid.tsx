"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./productsGrid.module.scss";
import ProductCard from "@/components/ui/productCard/productCard";

type ProductType = "terea" | "iqos" | "devices";

interface Product {
  id?: number;
  ref?: string;
  name?: string;
  description?: string;
  image?: string;
  imagePack?: string;
  price?: string;
  pricePack?: string;
  type: ProductType;
  model?: string;
  color?: string;
  country?: string;
  brend?: string;
  strength?: string;
  flavor?: string[];
  category?: {
    id: number;
    category_name: string;
  };
  priceValue?: number;
  pricePackValue?: number;
}

interface ProductsGridProps {
  category: ProductType;
  paginationMode?: "showMore" | "pages";
  perPage?: number;
  filters?: any;
  onFiltersReset?: () => void;
}

export default function ProductsGrid({
  category,
  paginationMode = "showMore",
  perPage = 8,
  filters = {},
  onFiltersReset,
}: ProductsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const [displayed, setDisplayed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToGrid = () => {
    const gridElement = document.querySelector(`.${styles.grid}`);
    if (gridElement)
      gridElement.scrollIntoView({ behavior: "smooth", block: "start" });
    else scrollToTop();
  };

  // Функция для получения значения продукта для фильтрации
  const getProductFilterValue = (product: Product, filterKey: string): any => {
    switch (filterKey) {
      case "brand":
        if (category === "iqos")
          return product.category?.category_name?.toLowerCase();
        if (category === "terea") return product.brend?.toLowerCase();
        if (category === "devices")
          return product.category?.category_name?.toLowerCase();
        return null;

      case "color":
        return product.color?.toLowerCase();

      case "country":
        return product.country?.toLowerCase();

      case "price":
        return product.priceValue || parseFloat(product.price || "0");

      default:
        return null;
    }
  };

  // Функция проверки соответствия фильтрам
  const matchesFilter = (
    product: Product,
    filterId: string,
    filterValue: any
  ): boolean => {
    const productValue = getProductFilterValue(product, filterId);

    if (
      !filterValue ||
      (Array.isArray(filterValue) && filterValue.length === 0)
    ) {
      return true;
    }

    switch (filterId) {
      case "brand":
      case "color":
      case "country":
        if (Array.isArray(filterValue)) {
          return filterValue.some((filterVal: string) => {
            const normalizedFilter = filterVal.toLowerCase();
            const normalizedProduct = String(productValue || "").toLowerCase();

            console.log(`Filtering ${filterId}:`, {
              filterVal: normalizedFilter,
              productValue: normalizedProduct,
              matches: normalizedProduct === normalizedFilter,
            });

            // Используем точное сравнение для стран
            return normalizedProduct === normalizedFilter;
          });
        }
        return (
          String(productValue).toLowerCase() ===
          String(filterValue).toLowerCase()
        );

      case "price":
        const productPrice = productValue;
        if (filterValue.min !== undefined && productPrice < filterValue.min) {
          return false;
        }
        if (filterValue.max !== undefined && productPrice > filterValue.max) {
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Функция применения фильтров
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    const filtered = products.filter((product) => {
      // Проверяем все активные фильтры
      for (const [filterId, filterValue] of Object.entries(filters)) {
        if (!matchesFilter(product, filterId, filterValue)) {
          return false;
        }
      }
      return true;
    });

    console.log(
      "Filtered products:",
      filtered.length,
      filtered.map((p) => ({
        id: p.id,
        name: p.name,
        country: p.country,
      }))
    );
    return filtered;
  }, [products, filters, category]);

  useEffect(() => {
    if (!category) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${category}`);
        if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
        const data = await res.json();

        // Преобразуем данные для фильтрации
        const processedProducts = (Array.isArray(data) ? data : [data]).map(
          (product: Product) => ({
            ...product,
            priceValue: parseFloat(product.price || "0"),
            pricePackValue: parseFloat(product.pricePack || "0"),
          })
        );

        setProducts(processedProducts);
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить товары");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  useEffect(() => {
    if (paginationMode === "showMore") {
      setDisplayed(filteredProducts.slice(0, page * perPage));
    } else {
      const start = (page - 1) * perPage;
      setDisplayed(filteredProducts.slice(start, start + perPage));
    }
  }, [filteredProducts, page, paginationMode, perPage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [page, router]);

  // Сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    setTimeout(scrollToGrid, 100);
  };

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  const handleNextPage = () =>
    setPage((prev) =>
      prev < Math.ceil(filteredProducts.length / perPage) ? prev + 1 : prev
    );

  useEffect(() => {
    if (paginationMode === "pages") scrollToTop();
  }, [page, paginationMode]);

  if (loading)
    return (
      <div className={styles.loading}>
        <p>Загрузка товаров...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.empty}>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryBtn}
        >
          Попробовать снова
        </button>
      </div>
    );

  if (!filteredProducts.length)
    return (
      <div className={styles.empty}>
        <p>Товары не найдены для выбранных фильтров</p>
        <button
          onClick={() => {
            onFiltersReset?.();
            setPage(1);
          }}
          className={styles.retryBtn}
        >
          Сбросить фильтры
        </button>
      </div>
    );

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {displayed.map((p) => {
          const productId = p.id ?? p.ref ?? Math.random().toString();
          const productRef = p.ref ?? productId;

          const variants =
            p.type === "terea" && p.imagePack
              ? [
                  {
                    type: "pack" as const,
                    imageUrl: p.imagePack ?? p.image ?? "",
                    price: Number(p.pricePack ?? p.price ?? 0),
                    name: `${p.name ?? "Товар"} (пачка)`,
                  },
                  {
                    type: "block" as const,
                    imageUrl: p.image ?? "",
                    price: Number(p.price ?? 0),
                    name: `${p.name ?? "Товар"} (блок)`,
                  },
                ]
              : [
                  {
                    type: "pack" as const,
                    imageUrl: p.image ?? "",
                    price: Number(p.price ?? 0),
                    name: p.name ?? "Товар",
                  },
                ];

          return (
            <ProductCard
              key={productId}
              id={p.ref || p.id?.toString()}
              variants={variants}
              url={`/product/${productRef}`}
              description={p.description ?? ""}
            />
          );
        })}
      </div>

      {paginationMode === "showMore" ? (
        displayed.length < filteredProducts.length && (
          <div className={styles.pagination}>
            <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
              Показать ещё
            </button>
          </div>
        )
      ) : (
        <div className={styles.pagination}>
          <button
            className={styles.navBtn}
            onClick={handlePrevPage}
            disabled={page === 1}
          >
            Назад
          </button>
          <span className={styles.pageInfo}>
            Страница {page} из {Math.ceil(filteredProducts.length / perPage)}
          </span>
          <button
            className={styles.navBtn}
            onClick={handleNextPage}
            disabled={page === Math.ceil(filteredProducts.length / perPage)}
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  );
}

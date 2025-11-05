"use client";

import { useEffect, useMemo, useState } from "react";
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
  nalichie?: boolean; // наличие товара
}

interface ProductsGridProps {
  category: ProductType;
  paginationMode?: "showMore" | "pages";
  perPage?: number;
  filters: any;
  onPageChange?: (page: number) => void;
  onFiltersReset?: () => void;
}

export default function ProductsGrid({
  category,
  paginationMode = "showMore",
  perPage = 8,
  filters = {},
  onPageChange,
  onFiltersReset,
}: ProductsGridProps) {
  const page = filters.page ? Number(filters.page) : 1;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Скролл к сетке
  const scrollToGrid = () => {
    const offset = 100; // высота шапки/отступ, если нужно
    window.scrollTo({
      top: 0, // можно заменить на gridElement?.offsetTop - offset
      behavior: "smooth",
    });
  };

  // Получаем продукты с API
  useEffect(() => {
    if (!category) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${category}`);
        if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
        const data = await res.json();

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

  // Получение значения фильтра для продукта
  const getProductFilterValue = (product: Product, filterKey: string) => {
    switch (filterKey) {
      case "brand":
        if (category === "iqos" || category === "devices")
          return product.category?.category_name?.toLowerCase();
        if (category === "terea") return product.brend?.toLowerCase();
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

  // Проверка совпадения фильтров
  const matchesFilter = (
    product: Product,
    filterId: string,
    filterValue: any
  ) => {
    const productValue = getProductFilterValue(product, filterId);

    if (
      !filterValue ||
      (Array.isArray(filterValue) && filterValue.length === 0)
    )
      return true;

    switch (filterId) {
      case "brand":
      case "color":
      case "country":
        if (Array.isArray(filterValue)) {
          return filterValue.some(
            (val: string) =>
              val.toLowerCase() === String(productValue || "").toLowerCase()
          );
        }
        return (
          String(productValue).toLowerCase() ===
          String(filterValue).toLowerCase()
        );

      case "price":
        const productPrice = productValue ?? 0;
        if (filterValue.min !== undefined && productPrice < filterValue.min)
          return false;
        if (filterValue.max !== undefined && productPrice > filterValue.max)
          return false;
        return true;

      case "search":
        if (!filterValue) return true;
        const term = filterValue.toLowerCase();
        return (
          product.name?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.country?.toLowerCase().includes(term) ||
          product.brend?.toLowerCase().includes(term)
        );

      default:
        return true;
    }
  };

  // Сортировка продуктов
  const sortProducts = (products: Product[], sortBy: string) => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
      case "price-desc":
        return sorted.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
      case "name-asc":
        return sorted.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
      case "name-desc":
        return sorted.sort((a, b) =>
          (b.name || "").localeCompare(a.name || "")
        );
      default:
        return sorted;
    }
  };

  // Фильтруем продукты
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    let filtered = products
      .filter((p) => p.nalichie) // 🔹 только товары в наличии
      .filter((p) => {
        for (const [filterId, value] of Object.entries(filters)) {
          if (filterId === "page") continue;
          if (!matchesFilter(p, filterId, value)) return false;
        }
        return true;
      });

    if (filters.sort) filtered = sortProducts(filtered, filters.sort);

    return filtered;
  }, [products, filters]);

  // Выводим только нужные для текущей страницы
  const displayed = useMemo(() => {
    if (paginationMode === "showMore") {
      return filteredProducts.slice(0, page * perPage);
    } else {
      const start = (page - 1) * perPage;
      return filteredProducts.slice(start, start + perPage);
    }
  }, [filteredProducts, page, paginationMode, perPage]);

  // Навигация по страницам
  const handleLoadMore = () => {
    const newPage = page + 1;
    onPageChange?.(newPage);
    setTimeout(scrollToGrid, 100); // плавный скролл
  };
  const handlePrevPage = () => {
    const newPage = Math.max(page - 1, 1);
    onPageChange?.(newPage);
    setTimeout(scrollToGrid, 100);
  };
  const handleNextPage = () => {
    const newPage = Math.min(
      page + 1,
      Math.ceil(filteredProducts.length / perPage)
    );
    onPageChange?.(newPage);
    setTimeout(scrollToGrid, 100);
  };

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
          className={styles.retryBtn}
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  if (!filteredProducts.length)
    return (
      <div className={styles.empty}>
        <p>Товары не найдены для выбранных фильтров</p>
        <button className={styles.retryBtn} onClick={onFiltersReset}>
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
                    nalichie: p.nalichie,
                  },
                  {
                    type: "block" as const,
                    imageUrl: p.image ?? "",
                    price: Number(p.price ?? 0),
                    name: `${p.name ?? "Товар"} (блок)`,
                    nalichie: p.nalichie,
                  },
                ]
              : [
                  {
                    type: "pack" as const,
                    imageUrl: p.image ?? "",
                    price: Number(p.price ?? 0),
                    name: p.name ?? "Товар",
                    nalichie: p.nalichie,
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

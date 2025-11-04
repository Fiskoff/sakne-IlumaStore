"use client";

import { useEffect, useState } from "react";
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
}

interface ProductsGridProps {
  category: ProductType;
  paginationMode?: "showMore" | "pages";
  perPage?: number;
}

export default function ProductsGrid({
  category,
  paginationMode = "showMore",
  perPage = 8,
}: ProductsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const [displayed, setDisplayed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Скролл
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToGrid = () => {
    const gridElement = document.querySelector(`.${styles.grid}`);
    if (gridElement)
      gridElement.scrollIntoView({ behavior: "smooth", block: "start" });
    else scrollToTop();
  };

  // Загрузка товаров
  useEffect(() => {
    if (!category) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${category}`);
        if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : [data]);
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

  // Отображаемые товары
  useEffect(() => {
    if (paginationMode === "showMore") {
      setDisplayed(products.slice(0, page * perPage));
    } else {
      const start = (page - 1) * perPage;
      setDisplayed(products.slice(start, start + perPage));
    }
  }, [products, page, paginationMode, perPage]);

  // Синхронизация страницы с URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [page, router]);

  // Хэндлеры пагинации
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    setTimeout(scrollToGrid, 100);
  };
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setPage((prev) =>
      prev < Math.ceil(products.length / perPage) ? prev + 1 : prev
    );

  useEffect(() => {
    if (paginationMode === "pages") scrollToTop();
  }, [page, paginationMode]);

  // Статусы загрузки
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

  if (!products.length)
    return (
      <div className={styles.empty}>
        <p>Товары не найдены для категории: {category}</p>
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
              id={productId.toString()}
              variants={variants}
              url={`/product/${productRef}`}
              description={p.description ?? ""}
            />
          );
        })}
      </div>

      {/* Пагинация */}
      {paginationMode === "showMore" ? (
        displayed.length < products.length && (
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
            Страница {page} из {Math.ceil(products.length / perPage)}
          </span>
          <button
            className={styles.navBtn}
            onClick={handleNextPage}
            disabled={page === Math.ceil(products.length / perPage)}
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ui/productCard/productCard";
import styles from "./similarProducts.module.scss";

interface SimilarProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  url: string;
  description: string;
  variants: any[];
}

interface SimilarProductsProps {
  currentProductId: string;
  category: string;
  limit?: number;
}

export default function SimilarProducts({
  currentProductId,
  category,
  limit = 4,
}: SimilarProductsProps) {
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false); // флаг чтобы fetch был один раз

  useEffect(() => {
    if (hasFetched.current) return;

    async function fetchSimilarProducts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/product/similar?productId=${currentProductId}&category=${category}&limit=${limit}`
        );

        if (!response.ok) throw new Error("Failed to fetch similar products");

        const data = await response.json();
        const availableProducts = data.filter((p: any) => p.nalichie);
        setSimilarProducts(availableProducts);
        setSimilarProducts(data);
      } catch (err) {
        console.error("Error fetching similar products:", err);
        setError("Не удалось загрузить похожие товары");
      } finally {
        setLoading(false);
      }
    }

    fetchSimilarProducts();
    hasFetched.current = true;
  }, [currentProductId, category, limit]);

  if (loading) {
    return (
      <section className={styles.similarProducts}>
        <h2 className={styles.title}>Также покупают</h2>
        <div className={styles.loading}>Загрузка...</div>
      </section>
    );
  }

  if (error || similarProducts.length === 0) {
    return null; // Не показываем блок если нет товаров или ошибка
  }

  return (
    <section className={styles.similarProducts}>
      <h2 className={styles.title}>Также покупают</h2>
      <div className={styles.productsGrid}>
        {similarProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            variants={product.variants}
            url={product.url}
            description={product.description}
          />
        ))}
      </div>
    </section>
  );
}

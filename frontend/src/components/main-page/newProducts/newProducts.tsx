"use client";

import { useEffect, useState } from "react";
import styles from "./newProducts.module.scss";
import ProductCard from "@/components/ui/productCard/productCard";

interface pageProps {
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
  new: number;
  variants: Variant[];
  url?: string;
}

export default function NewProducts({ title, limit }: pageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Проверяем мобильную ширину
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Загружаем новинки
  useEffect(() => {
    async function fetchNewProducts() {
      try {
        setLoading(true);
        const categories = ["terea", "iqos", "devices"];
        const allData: Product[] = [];

        for (const category of categories) {
          const res = await fetch(`/api/products/${category}`);
          if (!res.ok) continue;
          const data = await res.json();

          // фильтруем только новые товары и только те, что в наличии
          const newItems = data.filter(
            (item: any) => item.new === 1 && item.nalichie
          );
          allData.push(...newItems);
        }

        const formatted = allData.map((p) => ({
          ...p,
          url: `/product/${p.ref}`,
        }));

        setProducts(formatted);
      } catch (error) {
        console.error("Ошибка при загрузке новинок:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNewProducts();
  }, []);

  const displayedProducts = limit ? products.slice(0, limit) : products;

  return (
    <section className="container">
      <div className={styles.header}>
        <h2>{title}</h2>
      </div>

      {loading ? (
        <p className={styles.loading}>Загрузка...</p>
      ) : displayedProducts.length > 0 ? (
        <div className={styles.grid}>
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={String(product.id)}
              variants={product.variants}
              url={product.url}
              description={product.description}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Пока нет новинок</p>
      )}
    </section>
  );
}

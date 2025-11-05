"use client";

import { useEffect, useState } from "react";
import styles from "./bestSellers.module.scss";
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
  hit: number;
  variants: Variant[];
  url?: string;
}

export default function BestSellers({ title, limit }: pageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Определяем ширину экрана
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Загружаем хиты продаж
  useEffect(() => {
    async function fetchBestSellers() {
      try {
        setLoading(true);
        const categories = ["terea", "iqos", "devices"];
        const allData: Product[] = [];

        for (const category of categories) {
          const res = await fetch(`/api/products/${category}`);
          if (!res.ok) continue;
          const data = await res.json();

          // фильтруем только hit = 1 и товары в наличии
          const hitItems = data.filter(
            (item: any) => item.hit === 1 && item.nalichie
          );
          allData.push(...hitItems);
        }

        const formatted = allData.map((p) => ({
          ...p,
          url: `/product/${p.ref}`,
        }));

        setProducts(formatted);
      } catch (error) {
        console.error("Ошибка при загрузке хитов продаж:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBestSellers();
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
        <p className={styles.empty}>Пока нет хитов продаж</p>
      )}
    </section>
  );
}

"use client";
import { FC, useEffect, useState } from "react";
import styles from "./bestSellers.module.scss";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ui/productCard/productCard";

export default function BestSellers() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const products = [
    {
      variants: [
        {
          type: "pack" as const,
          imageUrl: "/productCard/Armenia Terea Yellow.png.webp",
          price: 2500,
          name: "Iqos Iluma One (пачка)",
        },
        {
          type: "block" as const,
          imageUrl: "/productCard/Armenia Terea Yellow Блок.png.webp",
          price: 12000,
          name: "Iqos Iluma One (блок)",
        },
      ],
      url: "/product/iqos-iluma-one",
    },
    {
      variants: [
        {
          type: "pack" as const,
          imageUrl: "/sales/sale1.webp",
          price: 4500,
          name: "IQOS Device",
        },
      ],
      url: "/product/iqos-device",
    },
    {
      variants: [
        {
          type: "pack" as const,
          imageUrl: "/sales/sale1.webp",
          price: 4500,
          name: "IQOS Device",
        },
      ],
      url: "/product/iqos-device",
    },
    {
      variants: [
        {
          type: "pack" as const,
          imageUrl: "/sales/sale1.webp",
          price: 4500,
          name: "IQOS Device",
        },
      ],
      url: "/product/iqos-device",
    },
  ];
  const displayedProducts = isMobile ? products.slice(0, 4) : products;

  return (
    <section className="container">
      <div className={styles.header}>
        <h2>Хит продаж</h2>
        <Link href="" className={styles.header_link}>
          Смотреть все
        </Link>
      </div>

      <div className={styles.grid}>
        {displayedProducts.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </div>
    </section>
  );
}

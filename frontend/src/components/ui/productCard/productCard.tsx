"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useNotification } from "@/context/NotificationContext";
import ProductModal from "../productModal/productModal";
import styles from "./productCard.module.scss";
import { generateCartItemId, generateProductId } from "@/utils/productId";
import { CartItem } from "@/types/cart/cart";
import { getStableProductBaseId } from "@/utils/productUtils";

export interface ProductVariant {
  type: "pack" | "block";
  imageUrl: string;
  price: number;
  name: string;
  nalichie?: boolean;
}

export interface ProductCardProps {
  id?: string;
  variants: ProductVariant[];
  url?: string;
  className?: string;
  description?: string;
}

// 🔥 ДОБАВЛЕНО: Функция для кодирования URL с русскими символами
function encodeImageUrl(url: string): string {
  if (!url) return "/placeholder.jpg";

  try {
    // Если это абсолютный URL
    if (url.startsWith("http")) {
      const urlObj = new URL(url);
      urlObj.pathname = encodeURI(urlObj.pathname);
      return urlObj.toString();
    }

    // Если это относительный путь
    // Разбиваем путь на части и кодируем каждую часть отдельно
    const parts = url.split("/");
    const encodedParts = parts.map((part) =>
      part.includes("%") || part === "" ? part : encodeURIComponent(part)
    );
    return encodedParts.join("/");
  } catch (error) {
    console.warn("Error encoding image URL:", url, error);
    return url;
  }
}

const ProductCard: FC<ProductCardProps> = ({
  id,
  variants,
  url,
  className = "",
  description,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const safeVariants =
    Array.isArray(variants) && variants.length > 0
      ? variants
      : [
          {
            type: "pack",
            imageUrl: "/placeholder.jpg",
            price: 0,
            name: "Без названия",
            nalichie: false,
          },
        ];
  const [activeVariant, setActiveVariant] = useState<"pack" | "block">(
    safeVariants[0].type as "pack" | "block"
  );

  const currentVariant =
    safeVariants.find((v) => v.type === activeVariant) || safeVariants[0];
  const hasMultipleVariants = safeVariants.length > 1;

  // 🔥 ИСПРАВЛЕНИЕ: Кодируем URL изображения
  const encodedImageUrl = encodeImageUrl(currentVariant.imageUrl);

  const { addItem } = useCart();
  const {
    addItem: addToFavorites,
    removeItem: removeFromFavorites,
    isFavorite,
  } = useFavorites();
  const { addNotification } = useNotification();

  // 🔥 ИСПРАВЛЕНИЕ: Безопасное формирование itemId
  const baseId = getStableProductBaseId(id, undefined, currentVariant.name);
  const variantType = currentVariant.type as "pack" | "block" | undefined;
  const itemId = generateProductId(baseId, variantType);
  const cartItemId = generateCartItemId(baseId, variantType);

  const isItemFavorite = isFavorite(itemId);

  // 🔥 ДОБАВЛЕНО: Проверка наличия товара
  const isInStock = currentVariant.nalichie !== false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isInStock) {
      addNotification({
        type: "error",
        title: "Товар недоступен",
        message: "К сожалению, этот товар закончился",
        duration: 3000,
      });
      return;
    }

    const cartItem: CartItem = {
      // 🔥 Явно указываем тип CartItem
      id: cartItemId,
      ref: id || currentVariant.name,
      name: currentVariant.name,
      price: currentVariant.price,
      quantity: 1,
      imageUrl: currentVariant.imageUrl, // Оригинальный URL для данных
      variant: hasMultipleVariants
        ? {
            type: currentVariant.type as "pack" | "block",
            name: currentVariant.type === "pack" ? "Пачка" : "Блок",
          }
        : undefined,
    };

    addItem(cartItem);

    addNotification({
      type: "success",
      title: "Товар добавлен в корзину",
      message: currentVariant.name,
      duration: 2000,
    });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isItemFavorite) {
      removeFromFavorites(itemId);
      addNotification({
        type: "info",
        title: "Товар удален из избранного",
        message: currentVariant.name,
        duration: 2000,
      });
    } else {
      addToFavorites({
        id: itemId,
        name: currentVariant.name,
        price: currentVariant.price,
        imageUrl: currentVariant.imageUrl, // Оригинальный URL для данных
        variant: hasMultipleVariants
          ? {
              type: currentVariant.type as "pack" | "block",
              name: currentVariant.type === "pack" ? "Пачка" : "Блок",
            }
          : undefined,
      });
      addNotification({
        type: "success",
        title: "Товар добавлен в избранное",
        message: currentVariant.name,
        duration: 2000,
      });
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <article className={`${styles.productCard} ${className}`.trim()}>
        <Link
          href={url || "#"}
          aria-label={`Купить ${currentVariant.name} — доставка по Москве`}
        >
          <div className={styles.productCard__image}>
            {/* 🔥 ДОБАВЛЕНО: Бейдж наличия */}
            {!isInStock && (
              <div className={styles.productCard__outOfStock}>
                Нет в наличии
              </div>
            )}

            {hasMultipleVariants && (
              <div className={styles.productCard__variants}>
                {["pack", "block"].map((type) => (
                  <button
                    key={type}
                    className={`${styles.productCard__variant} ${
                      activeVariant === type
                        ? styles.productCard__variant_active
                        : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveVariant(type as "pack" | "block");
                    }}
                  >
                    {type === "pack" ? "Пачка" : "Блок"}
                  </button>
                ))}
              </div>
            )}

            {/* 🔥 ИСПРАВЛЕНИЕ: Используем закодированный URL для отображения */}
            <Image
              src={encodedImageUrl}
              alt={`${currentVariant.name} — купить в Москве с доставкой`}
              width={400}
              height={400}
              className={styles.productCard__img}
              onError={(e) => {
                // Fallback при ошибке загрузки
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.jpg";
              }}
            />

            <div className={styles.productCard__action}>
              <Image
                src={"/productCard/modal.svg"}
                alt="Быстрый просмотр"
                width={20}
                height={20}
                onClick={handleModalClick}
              />
              <span
                onClick={handleAddToCart}
                className={!isInStock ? styles.productCard__actionDisabled : ""}
              >
                {isInStock ? "В корзину" : "Нет в наличии"}
              </span>
              <div
                className={`${styles.productCard__favoriteBtn} ${
                  isItemFavorite ? styles.productCard__favoriteBtn_active : ""
                }`}
                onClick={handleFavoriteClick}
              >
                <Image
                  src={
                    isItemFavorite
                      ? "/productCard/fill-like.svg"
                      : "/productCard/like.svg"
                  }
                  alt="В избранное"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>

          <div className={styles.productCard__info}>
            <h3 className={styles.productCard__name}>{currentVariant.name}</h3>
            <span className={styles.productCard__price}>
              {currentVariant.price.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </Link>

        {/* JSON-LD для SEO */}
        {id && (
          <Script id={`product-jsonld-${id}`} type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: currentVariant.name,
              image: currentVariant.imageUrl, // Оригинальный URL для SEO
              description,
              brand: { "@type": "Brand", name: "IQOS / TEREA" },
              offers: {
                "@type": "Offer",
                price: currentVariant.price,
                priceCurrency: "RUB",
                availability: isInStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                url: url,
              },
            })}
          </Script>
        )}
      </article>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variants={variants}
        productName={currentVariant.name}
        description={description}
        id={id}
      />
    </>
  );
};

export default ProductCard;

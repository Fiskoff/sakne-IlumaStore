"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useNotification } from "@/context/NotificationContext";
import ProductModal from "../productModal/productModal";
import styles from "./productCard.module.scss";

export interface ProductVariant {
  type: "pack" | "block";
  imageUrl: string;
  price: number;
  name: string;
}

export interface ProductCardProps {
  id?: string; // ref продукта
  variants: ProductVariant[];
  url?: string;
  className?: string;
  description?: string;
}

const ProductCard: FC<ProductCardProps> = ({
  id,
  variants,
  url,
  className = "",
  description,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeVariant, setActiveVariant] = useState<"pack" | "block">(
    variants[0]?.type || "pack"
  );
  const currentVariant =
    variants.find((v) => v.type === activeVariant) || variants[0];
  const hasMultipleVariants = variants.length > 1;

  const { addItem } = useCart();
  const {
    addItem: addToFavorites,
    removeItem: removeFromFavorites,
    isFavorite,
  } = useFavorites();
  const { addNotification } = useNotification();

  const itemId = `${id}-${currentVariant.type}`;
  const isItemFavorite = isFavorite(itemId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      ref: id,
      name: currentVariant.name,
      price: currentVariant.price,
      quantity: 1,
      imageUrl: currentVariant.imageUrl,
      variant: hasMultipleVariants
        ? {
            type: currentVariant.type,
            name: currentVariant.type === "pack" ? "Пачка" : "Блок",
          }
        : undefined,
    });

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
        imageUrl: currentVariant.imageUrl,
        variant: hasMultipleVariants
          ? {
              type: currentVariant.type,
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
      <Link
        href={url || "#"}
        className={`${styles.productCard} ${className}`.trim()}
      >
        <div className={styles.productCard__image}>
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

          <Image
            src={currentVariant.imageUrl}
            alt={currentVariant.name}
            width={400}
            height={400}
            className={styles.productCard__img}
          />

          <div className={styles.productCard__action}>
            <Image
              src={"/productCard/modal.svg"}
              alt="Быстрый просмотр"
              width={20}
              height={20}
              onClick={handleModalClick}
            />
            <span onClick={handleAddToCart}>В корзину</span>
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

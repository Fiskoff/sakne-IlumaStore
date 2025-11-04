"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useNotification } from "@/context/NotificationContext";
import styles from "./productPage.module.scss";
import BreadCrumbs from "@/components/common/breadcrums";
import { isProductInStock } from "@/utils/stock";

export interface ProductVariant {
  type: "pack" | "block";
  imageUrl: string;
  price: number;
  name: string;
  nalichie: boolean;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  variants: ProductVariant[];
  features: string[];
  specifications: ProductSpecification[];
}

interface ProductPageProps {
  product: Product;
}

const ProductPage: React.FC<ProductPageProps> = ({ product }) => {
  const [activeVariant, setActiveVariant] = useState<"pack" | "block">(
    product.variants[0]?.type || "pack"
  );
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { addItem: addToFavorites, removeItem, isFavorite } = useFavorites();
  const { addNotification } = useNotification();

  const currentVariant =
    product.variants.find((v) => v.type === activeVariant) ||
    product.variants[0];
  const hasMultipleVariants = product.variants.length > 1;

  const itemId = `${product.id}-${currentVariant.type}`;
  const isItemFavorite = isFavorite(itemId);

  const isInStock = isProductInStock(currentVariant.nalichie);

  useEffect(() => {
    setQuantity(1);
  }, [currentVariant]);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!isInStock) return;

    addItem({
      ref: itemId,
      name: currentVariant.name,
      price: currentVariant.price,
      quantity,
      imageUrl: currentVariant.imageUrl,
      variant: {
        type: currentVariant.type,
        name: currentVariant.type === "pack" ? "Пачка" : "Блок",
      },
    });

    addNotification({
      type: "success",
      title: "Товар добавлен в корзину",
      message: `${currentVariant.name} (${
        currentVariant.type === "pack" ? "Пачка" : "Блок"
      })`,
      duration: 2000,
    });
  };

  const handleFavoriteClick = () => {
    if (isItemFavorite) {
      removeItem(itemId);
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
        variant: {
          type: currentVariant.type,
          name: currentVariant.type === "pack" ? "Пачка" : "Блок",
        },
      });
      addNotification({
        type: "success",
        title: "Товар добавлен в избранное",
        message: currentVariant.name,
        duration: 2000,
      });
    }
  };

  return (
    <div className="hero-container">
      <BreadCrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: product.name },
        ]}
      />

      <div className={styles.productContent}>
        <div className={styles.productImage}>
          <div className={styles.productImage__container}>
            <div
              className={`${styles.stockBadge} ${
                isInStock
                  ? styles.stockBadge_inStock
                  : styles.stockBadge_outOfStock
              }`}
            >
              {isInStock ? "В наличии" : "Нет в наличии"}
            </div>

            <Image
              src={currentVariant.imageUrl}
              alt={product.name}
              width={1920}
              height={1080}
              className={styles.productImage__main}
              priority
            />
          </div>
        </div>

        <div className={styles.productInfo}>
          <h1 className={styles.productInfo__title}>{product.name}</h1>

          {hasMultipleVariants && (
            <div className={styles.productInfo__variants}>
              <h3 className={styles.productInfo__subtitle}>Вариант:</h3>
              <div className={styles.variants}>
                {product.variants.map((variant) => (
                  <button
                    key={variant.type}
                    className={`${styles.variant} ${
                      activeVariant === variant.type
                        ? styles.variant_active
                        : ""
                    }`}
                    onClick={() => setActiveVariant(variant.type)}
                  >
                    {variant.type === "pack" ? "Пачка" : "Блок"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.productInfo__price}>
            <span className={styles.price}>
              {currentVariant.price.toLocaleString("ru-RU")} ₽
            </span>
          </div>

          <div className={styles.productInfo__description}>
            <p>{product.description}</p>
          </div>

          <div className={styles.purchaseBlock}>
            <div className={styles.quantity}>
              <span className={styles.quantity__label}>Количество:</span>
              <div className={styles.quantity__controls}>
                <button
                  className={styles.quantity__btn}
                  onClick={decreaseQuantity}
                  disabled={!isInStock}
                >
                  -
                </button>
                <span className={styles.quantity__value}>{quantity}</span>
                <button
                  className={styles.quantity__btn}
                  onClick={increaseQuantity}
                  disabled={!isInStock}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles.addToCart} ${
                  !isInStock ? styles.addToCart_disabled : ""
                }`}
                onClick={handleAddToCart}
                disabled={!isInStock}
              >
                {isInStock ? "В корзину" : "Нет в наличии"}
              </button>

              <button
                className={`${styles.addToFavorites} ${
                  isItemFavorite ? styles.addToFavorites_active : ""
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
                <span>{isItemFavorite ? "В избранном" : "В избранное"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

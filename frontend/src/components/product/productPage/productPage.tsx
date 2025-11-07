// components/product/productPage/productPage.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useNotification } from "@/context/NotificationContext";
import styles from "./productPage.module.scss";
import BreadCrumbs from "@/components/common/breadcrums";
import { isProductInStock } from "@/utils/stock";
import SimilarProducts from "../similarProducts/similarProducts";
import { generateCartItemId, generateProductId } from "@/utils/productId";
import { CartItem } from "@/types/cart/cart";

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
  id: string | number;
  name: string;
  description: string;
  price?: number;
  imageUrl?: string;
  variants: ProductVariant[];
  features?: string[];
  specifications?: ProductSpecification[];
  type: "iqos" | "terea" | "devices";
  ref?: string;
  image?: string;
  model?: string;
  color?: string;
  nalichie?: boolean;
}

interface ProductPageProps {
  product: Product;
}

const ProductPage: React.FC<ProductPageProps> = ({ product }) => {
  // 🔥 ИСПРАВЛЕНИЕ: Обработка разных форматов данных
  const mainImageUrl =
    product.imageUrl || product.image || product.variants?.[0]?.imageUrl;
  const mainPrice = product.price || product.variants?.[0]?.price || 0;
  const productName = product.name || "Товар";

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
  const isTereaProduct = product.type === "terea";

  // 🔥 ИСПРАВЛЕНИЕ: Правильное формирование itemId
  const baseId = product.name.trim().toLowerCase().replace(/\s+/g, "-");
  const itemId = generateProductId(baseId, currentVariant.type);
  const cartItemId = generateCartItemId(baseId, currentVariant.type);

  const isItemFavorite = isFavorite(itemId);
  const isInStock = isProductInStock(currentVariant.nalichie);
  const getProductCategory = () => {
    if (
      product.name.toLowerCase().includes("iqos") ||
      product.type === "iqos"
    ) {
      return "iqos";
    } else if (
      product.name.toLowerCase().includes("terea") ||
      product.type === "terea"
    ) {
      return "terea";
    } else {
      return "devices";
    }
  };

  useEffect(() => {
    setQuantity(1);
  }, [currentVariant]);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // 🔥 ИСПРАВЛЕНИЕ: Убираем "Пачка"/"Блок" для не-TEREA товаров
  const getVariantDisplayName = () => {
    if (!isTereaProduct) return "";
    return currentVariant.type === "pack" ? "Пачка" : "Блок";
  };

  const handleAddToCart = () => {
    if (!isInStock) return;

    const cartItem: CartItem = {
      id: cartItemId,
      ref: product.id.toString(),
      name: currentVariant.name,
      price: currentVariant.price,
      quantity,
      imageUrl: currentVariant.imageUrl,
      // Всегда добавляем вариант, если есть multiple variants
      ...(hasMultipleVariants && {
        variant: {
          type: currentVariant.type,
          name: currentVariant.type === "pack" ? "Пачка" : "Блок",
        },
      }),
    };

    addItem(cartItem);

    addNotification({
      type: "success",
      title: "Товар добавлен в корзину",
      message: currentVariant.name,
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
      // 🔥 ИСПРАВЛЕНИЕ: Всегда добавляем вариант, если есть multiple variants
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

  if (!product || !product.variants || product.variants.length === 0) {
    console.error("❌ Invalid product data:", product);
    return (
      <div className="hero-container">
        <div className={styles.error}>
          <h1>Ошибка загрузки товара</h1>
          <p>
            Не удалось загрузить данные товара. Попробуйте обновить страницу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-container">
      <BreadCrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: product.type, href: `/catalog/${product.type}` },
          { label: productName },
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
              alt={productName}
              width={1920}
              height={1080}
              className={styles.productImage__main}
              priority
            />
          </div>
        </div>

        <div className={styles.productInfo}>
          <h1 className={styles.productInfo__title}>{productName}</h1>

          {/* 🔥 ИСПРАВЛЕНИЕ: Показываем варианты только для TEREA товаров */}
          {isTereaProduct && hasMultipleVariants && (
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
      <SimilarProducts
        currentProductId={product.id.toString()}
        category={getProductCategory()}
        limit={4}
      />
    </div>
  );
};

export default ProductPage;

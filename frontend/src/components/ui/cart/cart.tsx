"use client";

import { FC, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import styles from "./cart.module.scss";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StockStatus {
  [itemId: string]: boolean;
}

const Cart: FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } =
    useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const [stockStatuses, setStockStatuses] = useState<StockStatus>({});
  const router = useRouter();
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  const checkCartStock = useCallback(async () => {
    if (items.length === 0) {
      setStockStatuses({});
      return;
    }

    console.log("=== STARTING STOCK CHECK ===");
    console.log("All cart items:", items);

    setIsCheckingStock(true);

    try {
      // Собираем информацию о товарах - используем ref из item.ref
      const itemsInfo = items.map((item) => {
        const variantType = item.variant?.type || "pack";
        const ref = item.ref; // Используем ref который пришел из ProductCard

        console.log(`Item:`, {
          id: item.id,
          ref: item.ref,
          variantType,
          name: item.name,
        });

        return {
          itemId: item.id,
          ref,
          variantType,
          originalItem: item,
        };
      });

      console.log("Items info:", itemsInfo);

      // Собираем уникальные refs
      const uniqueRefs = [...new Set(itemsInfo.map((info) => info.ref))].filter(
        Boolean
      );
      console.log("Unique refs to check:", uniqueRefs);

      if (uniqueRefs.length === 0) {
        console.log("No valid refs to check");
        const stockMap: StockStatus = {};
        items.forEach((item) => (stockMap[item.id] = true));
        setStockStatuses(stockMap);
        return;
      }

      // Проверяем наличие через API
      const res = await fetch("/api/products/check-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refs: uniqueRefs }),
      });

      console.log("API Response status:", res.status);

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const apiResponse = await res.json();
      console.log("API Response data:", apiResponse);

      // Обрабатываем результаты
      const stockMap: StockStatus = {};

      itemsInfo.forEach(({ itemId, ref, variantType }) => {
        const productData = apiResponse[ref];
        console.log(`Processing ${itemId}:`, { ref, variantType, productData });

        if (!productData) {
          console.log(`❌ No product data for ref: ${ref}`);
          stockMap[itemId] = false;
          return;
        }

        // Проверяем общее наличие товара
        let inStock = Boolean(productData.nalichie);
        console.log(
          `📦 Base stock for ${ref}: ${productData.nalichie} -> ${inStock}`
        );

        // Проверяем наличие конкретного варианта
        if (productData.variants) {
          const matchingVariant = productData.variants.find(
            (v: any) => v.type === variantType
          );

          console.log(
            `🔍 Looking for variant ${variantType}:`,
            matchingVariant
          );

          if (matchingVariant && "nalichie" in matchingVariant) {
            inStock = Boolean(matchingVariant.nalichie);
            console.log(
              `🎯 Variant stock: ${matchingVariant.nalichie} -> ${inStock}`
            );
          }
        }

        console.log(`✅ Final stock status for ${itemId}: ${inStock}`);
        stockMap[itemId] = inStock;
      });

      console.log("Final stock map:", stockMap);
      setStockStatuses(stockMap);
    } catch (error) {
      console.error("❌ Error checking stock:", error);
      // Fallback: все товары в наличии при ошибке
      const fallback: StockStatus = {};
      items.forEach((item) => (fallback[item.id] = true));
      setStockStatuses(fallback);
    } finally {
      setIsCheckingStock(false);
    }
  }, [items]);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      const timeoutId = setTimeout(() => {
        checkCartStock();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, items, checkCartStock]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleOrder = () => {
    const hasOutOfStock = items.some((item) => !stockStatuses[item.id]);
    if (hasOutOfStock) {
      alert("В корзине есть товары, которых нет в наличии");
      return;
    }

    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      onClose();
      router.push("/checkout");
    }, 1000);
  };

  return (
    <div
      className={`${styles.cartOverlay} ${isOpen ? styles.open : ""}`}
      onClick={handleOverlayClick}
    >
      <div className={styles.cart}>
        <div className={styles.cart__header}>
          <h2 className={styles.cart__title}>Корзина</h2>
          <button className={styles.cart__close} onClick={onClose}>
            <Image
              src="/productCard/close.svg"
              alt="Закрыть"
              width={35}
              height={35}
            />
          </button>
        </div>

        <div className={styles.cart__content}>
          {items.length === 0 ? (
            <div className={styles.cart__empty}>
              <Image
                src="/cart/empty.svg"
                alt="Корзина пуста"
                width={100}
                height={100}
              />
              <p>Ваша корзина пуста!</p>
              <button
                className={styles.cart__continueShopping}
                onClick={onClose}
              >
                Продолжить покупки
              </button>
            </div>
          ) : (
            <>
              <div className={styles.cart__items}>
                {items.map((item) => {
                  const inStock = stockStatuses[item.id];
                  return (
                    <div key={item.id} className={styles.cartItem}>
                      <div className={styles.cartItem__image}>
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={100}
                          height={100}
                        />
                      </div>

                      <div className={styles.cartItem__info}>
                        <h4 className={styles.cartItem__name}>{item.name}</h4>
                        {item.variant && (
                          <p className={styles.cartItem__variant}>
                            {item.variant.name}
                          </p>
                        )}
                        <p className={styles.cartItem__price}>
                          {item.price.toLocaleString("ru-RU")} ₽
                        </p>
                        {!inStock && (
                          <span className={styles.cartItem__outOfStock}>
                            {isCheckingStock ? "Проверка..." : "Нет в наличии"}
                          </span>
                        )}
                      </div>

                      <div className={styles.cartItem__controls}>
                        <div className={styles.cartItem__quantity}>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className={styles.cartItem__quantityBtn}
                            disabled={!inStock}
                          >
                            -
                          </button>
                          <span className={styles.cartItem__quantityValue}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className={styles.cartItem__quantityBtn}
                            disabled={!inStock}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className={styles.cartItem__remove}
                        >
                          <Image
                            src="/cart/delete.svg"
                            alt="Удалить"
                            width={25}
                            height={25}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.cart__footer}>
                <div className={styles.cart__total}>
                  <span>Итого:</span>
                  <span className={styles.cart__totalPrice}>
                    {totalPrice.toLocaleString("ru-RU")} ₽
                  </span>
                </div>

                <div className={styles.cart__actions}>
                  <button className={styles.cart__clear} onClick={clearCart}>
                    Очистить корзину
                  </button>
                  <button
                    className={styles.cart__order}
                    onClick={handleOrder}
                    disabled={
                      isOrdering ||
                      isCheckingStock ||
                      items.some((item) => !stockStatuses[item.id])
                    }
                  >
                    {isOrdering
                      ? "Оформляем..."
                      : isCheckingStock
                      ? "Проверка..."
                      : "Оформить заказ"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

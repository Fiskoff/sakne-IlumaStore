"use client";

import { FC, useState, useEffect } from "react";
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

  const checkCartStock = async () => {
    if (items.length === 0) {
      setStockStatuses({});
      return;
    }

    setIsCheckingStock(true);

    try {
      const results = await Promise.all(
        items.map(async (item) => {
          try {
            const parts = item.id.split("-");
            const ref = parts.slice(0, -1).join("-");
            const variantType = parts.slice(-1)[0];

            const res = await fetch(`/api/products/${ref}`);
            if (!res.ok) {
              return { itemId: item.id, inStock: false };
            }

            const productData = await res.json();

            let inStock = Boolean(productData.nalichie);

            const matchingVariant = productData.variants?.find(
              (v: any) => v.type === variantType
            );

            if (matchingVariant && "nalichie" in matchingVariant) {
              inStock = Boolean(matchingVariant.nalichie);
            }

            return { itemId: item.id, inStock };
          } catch (err) {
            return { itemId: item.id, inStock: false };
          }
        })
      );

      const stockMap: StockStatus = {};
      results.forEach((r) => (stockMap[r.itemId] = r.inStock));
      setStockStatuses(stockMap);
    } catch (error) {
      console.error("Error checking stock:", error);
    } finally {
      setIsCheckingStock(false);
    }
  };

  useEffect(() => {
    checkCartStock();
    const interval = setInterval(checkCartStock, 60000);
    return () => clearInterval(interval);
  }, [items]);

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
                      items.some((item) => !stockStatuses[item.id])
                    }
                  >
                    {isOrdering ? "Оформляем..." : "Оформить заказ"}
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

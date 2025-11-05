"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import styles from "./cart.module.scss";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } =
    useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const router = useRouter();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleOrder = () => {
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
                {items.map((item) => (
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
                    </div>

                    <div className={styles.cartItem__controls}>
                      <div className={styles.cartItem__quantity}>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className={styles.cartItem__quantityBtn}
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
                ))}
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
                    disabled={isOrdering}
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

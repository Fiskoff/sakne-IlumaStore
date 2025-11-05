"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./order-success.module.scss";

export default function OrderSuccessPage() {
  return (
    <div className={styles.success}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Заказ успешно оформлен!</h1>
          <p className={styles.message}>
            Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для
            подтверждения.
          </p>
          <div className={styles.actions}>
            <Link href="/catalog" className={styles.continueShopping}>
              Продолжить покупки
            </Link>
            <Link href="/" className={styles.homeLink}>
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

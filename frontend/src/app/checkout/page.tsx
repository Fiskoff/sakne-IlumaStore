// app/checkout/page.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./checkout.module.scss";

type DeliveryMethod = "pickup" | "delivery";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("pickup");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
  });

  const pickupAddress = "г. Москва, ул. Примерная, д. 123, офис 45";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = "";

    if (value.length > 0) {
      formattedValue = "+7 ";
      if (value.length > 1) {
        formattedValue += `(${value.substring(1, 4)}`;
      }
      if (value.length > 4) {
        formattedValue += `) ${value.substring(4, 7)}`;
      }
      if (value.length > 7) {
        formattedValue += `-${value.substring(7, 9)}`;
      }
      if (value.length > 9) {
        formattedValue += `-${value.substring(9, 11)}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      phone: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Валидация
    if (!formData.name.trim()) {
      alert("Пожалуйста, введите ваше имя");
      setIsSubmitting(false);
      return;
    }

    if (
      !formData.phone.trim() ||
      formData.phone.replace(/\D/g, "").length < 11
    ) {
      alert("Пожалуйста, введите корректный номер телефона");
      setIsSubmitting(false);
      return;
    }

    if (deliveryMethod === "delivery") {
      if (!formData.city.trim()) {
        alert("Пожалуйста, введите город");
        setIsSubmitting(false);
        return;
      }
      if (!formData.address.trim()) {
        alert("Пожалуйста, введите адрес доставки");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const orderData = {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        deliveryMethod,
        pickupAddress: deliveryMethod === "pickup" ? pickupAddress : undefined,
        items,
        totalPrice,
      };

      const res = await fetch("http://127.0.0.1:8000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error("Ошибка отправки заказа на сервер");
      }

      clearCart();
      router.push("/order-success");
    } catch (error) {
      console.error(error);
      alert("Не удалось отправить заказ. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.emptyCartContent}>
          <Image
            src="/cart/empty.svg"
            alt="Корзина пуста"
            width={150}
            height={150}
          />
          <h2>Корзина пуста</h2>
          <p>Добавьте товары в корзину для оформления заказа</p>
          <button
            className={styles.continueShopping}
            onClick={() => router.push("/catalog")}
          >
            Перейти в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Оформление заказа</h1>

        <div className={styles.content}>
          {/* Левая колонка - Форма */}
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.orderForm}>
              {/* Личные данные */}
              <div className={styles.formGroup}>
                <h3>Контактные данные</h3>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Имя *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Введите ваше имя"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="phone">Телефон *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    required
                    placeholder="+7 (999) 999-99-99"
                  />
                </div>
              </div>

              {/* Способ получения */}
              <div className={styles.formGroup}>
                <h3>Способ получения</h3>
                <div className={styles.deliveryMethods}>
                  <label className={styles.deliveryMethod}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={deliveryMethod === "pickup"}
                      onChange={(e) =>
                        setDeliveryMethod(e.target.value as DeliveryMethod)
                      }
                    />
                    <span className={styles.radioCustom}></span>
                    <div className={styles.deliveryInfo}>
                      <span className={styles.deliveryTitle}>Самовывоз</span>
                      <span className={styles.deliveryDescription}>
                        Бесплатно
                      </span>
                    </div>
                  </label>

                  <label className={styles.deliveryMethod}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={deliveryMethod === "delivery"}
                      onChange={(e) =>
                        setDeliveryMethod(e.target.value as DeliveryMethod)
                      }
                    />
                    <span className={styles.radioCustom}></span>
                    <div className={styles.deliveryInfo}>
                      <span className={styles.deliveryTitle}>Доставка</span>
                      <span className={styles.deliveryDescription}>
                        Стоимость уточняется
                      </span>
                    </div>
                  </label>
                </div>

                {/* Адрес самовывоза */}
                {deliveryMethod === "pickup" && (
                  <div className={styles.pickupAddress}>
                    <h4>Адрес самовывоза:</h4>
                    <p>{pickupAddress}</p>
                    <p className={styles.pickupHours}>
                      Часы работы: 10:00 - 20:00
                    </p>
                  </div>
                )}

                {/* Поля для доставки */}
                {deliveryMethod === "delivery" && (
                  <div className={styles.deliveryFields}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="city">Город *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Введите город"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="address">Адрес доставки *</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Введите адрес доставки"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Кнопка оформления */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner}></div>
                    Оформляем заказ...
                  </>
                ) : (
                  `Оформить заказ · ${totalPrice.toLocaleString("ru-RU")} ₽`
                )}
              </button>
            </form>
          </div>

          {/* Правая колонка - Товары и итоги */}
          <div className={styles.cartSection}>
            <div className={styles.cartItems}>
              <h3>Ваш заказ</h3>
              {items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.cartItemImage}>
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                    />
                  </div>
                  <div className={styles.cartItemInfo}>
                    <h4 className={styles.cartItemName}>{item.name}</h4>
                    {item.variant && (
                      <p className={styles.cartItemVariant}>
                        {item.variant.name}
                      </p>
                    )}
                    <div className={styles.cartItemDetails}>
                      <span className={styles.cartItemQuantity}>
                        {item.quantity} шт.
                      </span>
                      <span className={styles.cartItemPrice}>
                        {item.price.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.orderSummary}>
              <h3>Итоги заказа</h3>
              <div className={styles.summaryRow}>
                <span>
                  Товары ({items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  шт.)
                </span>
                <span>{totalPrice.toLocaleString("ru-RU")} ₽</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Доставка</span>
                <span>
                  {deliveryMethod === "pickup"
                    ? "Бесплатно"
                    : "Рассчитывается отдельно"}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Итого</span>
                <span className={styles.totalPrice}>
                  {totalPrice.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./checkout.module.scss";

type DeliveryMethod = "pickup" | "delivery";

// Константы для Telegram бота
const TELEGRAM_BOT_TOKEN = "7364548522:AAGpn05pGfX3rqtu8if1BDxILlbtOUGHbeA";
const TELEGRAM_CHAT_ID = "-1002155675591";

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

  // Функция для отправки уведомления в Telegram
  const sendTelegramNotification = async (orderData: any) => {
    try {
      // Формируем красивое сообщение для Telegram
      const message = `
🛒 *НОВЫЙ ЗАКАЗ С САЙТА iluma-store.ru*

*Контактные данные:*
 Имя: ${orderData.customer_name}
 Телефон: ${orderData.phone_number}
 Способ: ${orderData.is_delivery ? "Доставка" : "Самовывоз"}

${
  orderData.is_delivery
    ? `📍 *Адрес доставки:*
 Город: ${orderData.city}
 Адрес: ${orderData.address}`
    : `📍 *Самовывоз:*
${pickupAddress}`
}

*Корзина:*
${orderData.ordered_items
  .map(
    (item: any, index: number) =>
      `• ${item.product_name} x${
        item.quantity
      }: ${item.price_at_time_of_order.toLocaleString("ru-RU")} ₽`
  )
  .join("\n")}

 *Общая сумма:* ${totalPrice.toLocaleString("ru-RU")} ₽
      `.trim();

      // Отправляем сообщение в Telegram
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка отправки в Telegram:", errorData);
        throw new Error("Не удалось отправить уведомление в Telegram");
      }

      console.log("✅ Уведомление отправлено в Telegram");
      return true;
    } catch (error) {
      console.error("❌ Ошибка при отправке в Telegram:", error);
      // Не прерываем основной поток оформления заказа из-за ошибки Telegram
      return false;
    }
  };

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
      const orderPayload = {
        customer_name: formData.name,
        phone_number: formData.phone.replace(/\D/g, ""),
        is_delivery: deliveryMethod === "delivery",
        city: formData.city || "",
        address: formData.address || "",
        ordered_items: items.map((item) => ({
          product_name: item.name,
          quantity: item.quantity,
          price_at_time_of_order: item.price,
        })),
      };

      // 🔥 Отправляем заказ на бэкенд
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        throw new Error("Ошибка отправки заказа на сервер");
      }

      // 🔥 Отправляем уведомление в Telegram
      const telegramSent = await sendTelegramNotification(orderPayload);

      if (!telegramSent) {
        console.warn(
          "⚠️ Заказ сохранен, но уведомление в Telegram не отправлено"
        );
        // Продолжаем выполнение, так как основной заказ сохранен
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

  // Добавляем noindex метатег
  useEffect(() => {
    // Создаем meta тег для noindex
    const metaNoindex = document.createElement("meta");
    metaNoindex.name = "robots";
    metaNoindex.content = "noindex, nofollow";
    document.head.appendChild(metaNoindex);

    // Очистка при размонтировании компонента
    return () => {
      document.head.removeChild(metaNoindex);
    };
  }, []);

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
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.orderForm}>
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

                {deliveryMethod === "pickup" && (
                  <div className={styles.pickupAddress}>
                    <h4>Адрес самовывоза:</h4>
                    <p>{pickupAddress}</p>
                    <p className={styles.pickupHours}>
                      Часы работы: 10:00 - 20:00
                    </p>
                  </div>
                )}

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

import { FC, useState } from "react";
import Image from "next/image";
import styles from "./productModal.module.scss";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useNotification } from "@/context/NotificationContext";

export interface ProductVariant {
  type: "pack" | "block";
  imageUrl: string;
  price: number;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  productName: string;
  description?: string;
  id?: string;
}

const ProductModal: FC<ProductModalProps> = ({
  isOpen,
  onClose,
  variants,
  productName,
  description = "Описание товара будет добавлено позже.",
  id,
}) => {
  const [activeVariant, setActiveVariant] = useState<"pack" | "block">(
    variants[0]?.type || "pack"
  );
  const [quantity, setQuantity] = useState(1);

  const currentVariant =
    variants.find((v) => v.type === activeVariant) || variants[0];
  const hasMultipleVariants = variants.length > 1;

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const { addItem } = useCart();
  const {
    addItem: addToFavorites,
    removeItem: removeFromFavorites,
    isFavorite,
  } = useFavorites();
  const { addNotification } = useNotification();

  const itemId = `${id || productName}-${currentVariant.type}`;
  const isItemFavorite = isFavorite(itemId);

  const handleAddToFavorites = () => {
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      ref: id ?? productName,
      name: currentVariant.name,
      price: currentVariant.price,
      quantity,
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

    onClose();
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.modal__close} onClick={onClose}>
          <Image
            src="/productCard/close.svg"
            alt="Закрыть"
            width={35}
            height={35}
          />
        </button>

        <div className={styles.modal__content}>
          <div className={styles.modal__image}>
            <Image
              src={currentVariant.imageUrl}
              alt={currentVariant.name}
              width={400}
              height={400}
              className={styles.modal__img}
            />
          </div>

          <div className={styles.modal__info}>
            <div className={styles.modal__infoContent}>
              <h2 className={styles.modal__title}>{productName}</h2>

              {hasMultipleVariants && (
                <div className={styles.modal__variants}>
                  <button
                    className={`${styles.modal__variant} ${
                      activeVariant === "pack"
                        ? styles.modal__variant_active
                        : ""
                    }`}
                    onClick={() => setActiveVariant("pack")}
                  >
                    Пачка
                  </button>
                  <button
                    className={`${styles.modal__variant} ${
                      activeVariant === "block"
                        ? styles.modal__variant_active
                        : ""
                    }`}
                    onClick={() => setActiveVariant("block")}
                  >
                    Блок
                  </button>
                </div>
              )}

              <p className={styles.modal__description}>{description}</p>
            </div>

            <div className={styles.modal__bottomSection}>
              <div className={styles.modal__action}>
                <div className={styles.modal__priceSection}>
                  <span className={styles.modal__price}>
                    {currentVariant.price.toLocaleString("ru-RU")} ₽
                  </span>
                  {hasMultipleVariants && (
                    <span className={styles.modal__priceNote}>
                      {activeVariant === "pack" ? "за пачку" : "за блок"}
                    </span>
                  )}
                </div>
                <div className={styles.modal__quantity}>
                  <span className={styles.modal__quantityLabel}>
                    Количество:
                  </span>
                  <div className={styles.modal__quantityControls}>
                    <button
                      className={styles.modal__quantityBtn}
                      onClick={decreaseQuantity}
                    >
                      -
                    </button>
                    <span className={styles.modal__quantityValue}>
                      {quantity}
                    </span>
                    <button
                      className={styles.modal__quantityBtn}
                      onClick={increaseQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.modal__actions}>
                <button
                  className={styles.modal__addToCart}
                  onClick={handleAddToCart}
                >
                  В корзину
                </button>
                <button
                  className={styles.modal__addToFavorites}
                  onClick={handleAddToFavorites}
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
    </div>
  );
};

export default ProductModal;

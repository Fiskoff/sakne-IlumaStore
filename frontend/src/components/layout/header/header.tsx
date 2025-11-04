"use client";
import Link from "next/link";
import styles from "./header.module.scss";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Cart from "@/components/ui/cart/cart";
import { useFavorites } from "@/context/FavoritesContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [likeItems, setLikeItems] = useState(0);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: favoriteItems } = useFavorites();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    const handleScrollCloseDropdown = () => {
      setIsScrolled(window.scrollY > 40);
      if (isCategoriesOpen) {
        closeDropdown();
      }
    };

    window.addEventListener("scroll", handleScrollCloseDropdown);
    return () => {
      window.removeEventListener("scroll", handleScrollCloseDropdown);
    };
  }, [isCategoriesOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(`.${styles.categories_dropdown}`) &&
        !target.closest(`.${styles.hero_top__left} span`)
      ) {
        if (isCategoriesOpen) {
          closeDropdown();
        }
      }
    };

    if (isCategoriesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoriesOpen]);

  const closeDropdown = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsCategoriesOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const toggleDropdown = () => {
    if (isCategoriesOpen) {
      closeDropdown();
    } else {
      setIsCategoriesOpen(true);
      setIsClosing(false);
    }
  };

  const categories = ["Iqos", "Terea", "Devices"];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero_container}>
          <div
            className={`${styles.hero_top} ${
              isScrolled ? styles.scrolled : ""
            }`}
          >
            <div className={styles.hero_top__left}>
              <Link href={"/"} className={styles.logo_container}>
                <Image
                  src={"/logo/ilumastorelogo.svg"}
                  alt="iluma"
                  height={55}
                  width={55}
                />
                <h2>Iluma-Store</h2>
              </Link>
              <div className={styles.categories_dropdown}>
                <span onClick={toggleDropdown}>
                  <Image
                    src="/header/dropdown.svg"
                    alt="dropdown"
                    height={20}
                    width={20}
                  />
                  Все категории
                  <Image
                    src="/header/arrow.svg"
                    alt="arrow"
                    height={20}
                    width={20}
                    className={
                      isCategoriesOpen && !isClosing ? styles.rotated : ""
                    }
                  />
                </span>

                {isCategoriesOpen && (
                  <div
                    className={`${styles.dropdown_menu} ${
                      isClosing ? styles.closing : ""
                    }`}
                  >
                    <div className={styles.dropdown_content}>
                      {categories.map((category, index) => (
                        <Link
                          key={index}
                          href={`/catalog/${category
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          onClick={() => closeDropdown()}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.hero_top__right}>
              <div className={styles.cart_container}>
                <Image
                  src={"/header/backet.svg"}
                  alt="backet"
                  width={25}
                  height={25}
                  className={styles.backet}
                  onClick={() => setIsCartOpen(true)}
                />
                {totalItems >= 0 && (
                  <span className={styles.cart_badge}>{totalItems}</span>
                )}
                <Link href="/wishlist">
                  <Image
                    src={"/header/like.svg"}
                    alt="backet"
                    width={25}
                    height={25}
                    className={styles.backet}
                  />
                  {favoriteItems >= 0 && (
                    <span className={styles.like_badge}>{favoriteItems}</span>
                  )}
                </Link>
              </div>
              <div className={styles.socials}>
                <Image src="/header/wa.svg" alt="wa" width={30} height={30} />
                <Image src="/header/tg.svg" alt="wa" width={30} height={30} />
                <Link href="tel:+7 (995) 153-80-19" className={styles.phone}>
                  +7 (995) 153-80-19
                </Link>
              </div>
            </div>
          </div>
          <div
            className={`${styles.hero_bottom} ${
              isScrolled ? styles.scrolled : ""
            }`}
          >
            <div className={styles.hero_bottom_left}>
              <nav className={styles.hero_bottom_left_nav}>
                <Link href="/new">Новинки</Link>
                <Link href="/catalog">Каталог</Link>
                <Link href="/blog">Блог</Link>
                <Link href="/contacts">Контакты</Link>
              </nav>
            </div>
            <div className={styles.hero_bottom_right}>
              <div className={styles.hero_bottom_right_nav}>
                <Link href="">Хит продаж</Link>
                <span>SALE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Добавляем компонент Cart */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

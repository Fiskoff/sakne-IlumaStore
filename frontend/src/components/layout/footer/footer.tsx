import styles from "./footer.module.scss";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <section className={styles.footer}>
      <div className={styles.footer_content}>
        <div className={styles.footer_section}>
          <div className={styles.logo_container}>
            <Image
              src="/logo/ilumastorelogo.svg"
              alt="iluma"
              height={70}
              width={70}
            />
            <h2 className={styles.logo_text}>Iluma-Store</h2>
          </div>
          <p className={styles.description}>
            Интернет-магазин современных технологичных устройств. Мы предлагаем
            качественную продукцию с доставкой по всей России.
          </p>
        </div>

        <div className={styles.footer_section}>
          <h3 className={styles.section_title}>Каталог</h3>
          <div className={styles.links_container}>
            <Link href={""}>Iqos ILuma</Link>
            <Link href={""}>Стики Terea</Link>
            <Link href={""}>Аксессуары</Link>
            <Link href={""}>Хит продаж</Link>
            <Link href={""}>Новинки</Link>
          </div>
        </div>

        <div className={styles.footer_section}>
          <h3 className={styles.section_title}>Информация</h3>
          <div className={styles.links_container}>
            <Link href={""}>О компании</Link>
            <Link href={""}>Доставка и оплата</Link>
            <Link href={""}>Гарантия</Link>
            <Link href={""}>Отзывы</Link>
            <Link href={""}>Блог</Link>
          </div>
        </div>

        <div className={styles.footer_section}>
          <h3 className={styles.section_title}>Контакты</h3>
          <div className={styles.contacts_container}>
            <Link href="tel:+7 (995) 153-80-19" className={styles.phone}>
              +7 (995) 153-80-19
            </Link>
            <p className={styles.work_hours}>Ежедневно с 9:00 до 21:00</p>
            <div className={styles.social_links}>
              <Link href="#" className={styles.social_link}>
                <Image
                  src="/header/wa.svg"
                  alt="WhatsApp"
                  height={30}
                  width={30}
                />
              </Link>
              <Link href="#" className={styles.social_link}>
                <Image
                  src="/header/tg.svg"
                  alt="Telegram"
                  height={30}
                  width={30}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer_bottom}>
        <div className={styles.copyright}>
          © 2025 Iluma Store. Все права защищены.
        </div>
        <div className={styles.legal_links}>
          <Link href={""}>Политика конфиденциальности</Link>
          <Link href={""}>Пользовательское соглашение</Link>
        </div>
      </div>
    </section>
  );
}

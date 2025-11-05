import BreadCrumbs from "@/components/common/breadcrums";
import styles from "./catalog.module.scss";
import BrowseCategory from "@/components/main-page/browseCategory/browseCategory";
import BrowseCountry from "@/components/main-page/browseCountry/browseCountry";
import Link from "next/link";

export default function Catalog() {
  return (
    <section className="hero-container">
      <div className={"second_page_header"}>
        <h1>Каталог</h1>
        <BreadCrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]}
        />
      </div>

      <div className={styles.catalog_content}>
        <Link href="/catalog/iqos" className={styles.iqos}>
          <div className={styles.categoryContent}>
            <h2>IQOS</h2>
            <p>Устройства для нагрева табака</p>
            <span className={styles.ctaButton}>Смотреть товары</span>
          </div>
        </Link>

        <div>
          <Link href="/catalog/terea" className={styles.terea}>
            <div className={styles.categoryContent}>
              <h2>Terea</h2>
              <p>Стики для устройств нагрева</p>
              <span className={styles.ctaButton}>Смотреть товары</span>
            </div>
          </Link>

          <Link href="/catalog/devices" className={styles.devices}>
            <div className={styles.categoryContent}>
              <h2>Устройства</h2>
              <p>Аксессуары и комплектующие</p>
              <span className={styles.ctaButton}>Смотреть товары</span>
            </div>
          </Link>
        </div>
      </div>

      <BrowseCategory />
      <BrowseCountry />
    </section>
  );
}

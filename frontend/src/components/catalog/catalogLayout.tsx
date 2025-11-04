"use client";

import BreadCrumbs from "../common/breadcrums";
import FiltersSidebar from "./filtersSideBar";
import { useState } from "react";
import Toolbar from "./toolbar";
import ProductsGrid from "./productsGrid/productsGrid";
import styles from "./catalogLayout.module.scss";

interface CatalogLayoutProps {
  category: "terea" | "iqos" | "devices";
}

export default function CatalogLayout({ category }: CatalogLayoutProps) {
  const [filters, setFilters] = useState<any>({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleFiltersChange = (newFilters: any) => setFilters(newFilters);

  const quickFilterOptions =
    category === "terea"
      ? ["Казахстан", "Узбекистан", "Армения", "Польша", "Япония"]
      : category === "iqos"
      ? ["One", "Standart", "Prime", "I One", "I Standart", "I Prime"]
      : [];

  const quickFilterKey = category === "terea" ? "country" : "model";

  const handleQuickFilter = (value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [quickFilterKey]: prev[quickFilterKey] === value ? undefined : value,
    }));
  };

  return (
    <section className="hero-container">
      <div className="second_page_header">
        <h1>Каталог</h1>
        <BreadCrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: category },
          ]}
        />
      </div>

      <div className={styles.catalogLayout}>
        {/* Кнопка фильтров для мобильных */}
        {/* <button
          className={styles.mobileFiltersToggle}
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6H20M4 12H20M4 18H20"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          Фильтры
        </button> */}

        {/* 🔹 Быстрые фильтры (только для мобильной версии) */}

        <div className={styles.catalogContainer}>
          {/* Боковая панель фильтров */}
          <div
            className={`${styles.sidebar} ${
              isMobileFiltersOpen ? styles.mobileOpen : ""
            }`}
          >
            <div className={styles.sidebarHeader}>
              <span>Фильтры</span>
              <button
                className={styles.closeMobileFilters}
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                ✕
              </button>
            </div>

            <FiltersSidebar
              category={category}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Основной контент */}
          <div className={styles.content}>
            <Toolbar
              onMobileFiltersToggle={() =>
                setIsMobileFiltersOpen(!isMobileFiltersOpen)
              }
            />
            {quickFilterOptions.length > 0 && (
              <div className={styles.quickFilters}>
                <div className={styles.filterSlider}>
                  {quickFilterOptions.map((item) => (
                    <button
                      key={item}
                      className={`${styles.filterChip} ${
                        filters[quickFilterKey] === item ? styles.active : ""
                      }`}
                      onClick={() => handleQuickFilter(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <ProductsGrid
              category={category}
              paginationMode="pages"
              perPage={12}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

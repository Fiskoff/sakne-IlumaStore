"use client";

import BreadCrumbs from "../common/breadcrums";
import FiltersSidebar from "./filtersSideBar";
import { useState, useCallback, useEffect } from "react";
import Toolbar from "./toolbar";
import ProductsGrid from "./productsGrid/productsGrid";
import styles from "./catalogLayout.module.scss";
import { useURLFilters } from "@/hooks/useURLFilters";

interface CatalogLayoutProps {
  category: "terea" | "iqos" | "devices";
  initialSub?: string; // 🔹 добавили подкатегорию, например "one" или "kazakhstan"
}

export default function CatalogLayout({
  category,
  initialSub,
}: CatalogLayoutProps) {
  const { filters, updateFilters, clearFilters } = useURLFilters();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // 🔹 Если есть initialSub из URL — применяем соответствующий фильтр при загрузке
  useEffect(() => {
    if (!initialSub) return;

    const normalized = decodeURIComponent(initialSub).toLowerCase();

    if (category === "iqos") {
      updateFilters({ brand: [normalized] });
    } else if (category === "terea") {
      updateFilters({ country: [normalized] });
    } else if (category === "devices") {
      updateFilters({ brand: [normalized] });
    }
  }, [initialSub, category, updateFilters]);

  // 🔹 Обработка обычных фильтров
  const handleFiltersChange = useCallback(
    (newFilters: any) => {
      updateFilters(newFilters);
    },
    [updateFilters]
  );

  // 🔹 Быстрые фильтры (кнопки)
  const getQuickFilterOptions = () => {
    switch (category) {
      case "terea":
        return [
          { value: "Казахстан", label: "Казахстан" },
          { value: "Узбекистан", label: "Узбекистан" },
          { value: "Армения", label: "Армения" },
          { value: "Индонезия", label: "Индонезия" },
          { value: "Польша", label: "Польша" },
          { value: "Япония", label: "Япония" },
          { value: "Швейцария", label: "Швейцария" },
          { value: "Европа", label: "Европа" },
        ];
      case "iqos":
        return [
          { value: "one", label: "One" },
          { value: "standart", label: "Standart" },
          { value: "prime", label: "Prime" },
          { value: "onei", label: "I One" },
          { value: "standarti", label: "I Standart" },
          { value: "primei", label: "I Prime" },
        ];
      case "devices":
        return [
          { value: "ringsiluma", label: "Кольца Iluma" },
          { value: "capsilumaprime", label: "Крышки Iluma Prime" },
          { value: "capsilumastandart", label: "Крышки Iluma Standart" },
          { value: "holderiqosiluma", label: "Держатель Iqos Iluma" },
        ];
      default:
        return [];
    }
  };

  const quickFilterOptions = getQuickFilterOptions();
  const quickFilterKey = category === "terea" ? "country" : "brand";

  // 🔹 Тоггл фильтров
  const handleQuickFilter = useCallback(
    (value: string) => {
      const currentFilters = filters[quickFilterKey] || [];
      const isActive = currentFilters.includes(value);

      const newFiltersValue = isActive
        ? currentFilters.filter((v: string) => v !== value)
        : [...currentFilters, value];

      const newFilters = {
        ...filters,
        [quickFilterKey]:
          newFiltersValue.length > 0 ? newFiltersValue : undefined,
      };

      if (newFiltersValue.length === 0) {
        delete newFilters[quickFilterKey];
      }

      updateFilters(newFilters);
    },
    [filters, quickFilterKey, updateFilters]
  );

  const isQuickFilterActive = (value: string) =>
    filters[quickFilterKey]?.includes(value) || false;

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  return (
    <section className="hero-container">
      <div className="second_page_header">
        <h1>
          Каталог
          {category && ` — ${category.toUpperCase()}`}
          {initialSub && ` ${decodeURIComponent(initialSub)}`}
        </h1>
        <BreadCrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: category, href: `/catalog/${category}` },
            ...(initialSub ? [{ label: decodeURIComponent(initialSub) }] : []),
          ]}
        />
      </div>

      <div className={styles.catalogLayout}>
        <div className={styles.catalogContainer}>
          {/* 🔹 Сайдбар */}
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

          {/* 🔹 Контент */}
          <div className={styles.content}>
            <Toolbar
              onMobileFiltersToggle={() =>
                setIsMobileFiltersOpen(!isMobileFiltersOpen)
              }
              onClearFilters={handleClearFilters}
              activeFiltersCount={Object.keys(filters).length}
            />

            {quickFilterOptions.length > 0 && (
              <div className={styles.quickFilters}>
                <div className={styles.filterSlider}>
                  {quickFilterOptions.map((item) => (
                    <button
                      key={item.value}
                      className={`${styles.filterChip} ${
                        isQuickFilterActive(item.value) ? styles.active : ""
                      }`}
                      onClick={() => handleQuickFilter(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ProductsGrid
              filters={filters}
              category={category}
              paginationMode="pages"
              perPage={12}
              onFiltersReset={handleClearFilters}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

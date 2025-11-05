"use client";

import BreadCrumbs from "../common/breadcrums";
import FiltersSidebar from "./filtersSideBar";
import { useState, useCallback, useEffect, useRef } from "react";
import Toolbar from "./toolbar";
import ProductsGrid from "./productsGrid/productsGrid";
import styles from "./catalogLayout.module.scss";
import { useURLFilters } from "@/hooks/useURLFilters";

interface CatalogLayoutProps {
  category: "terea" | "iqos" | "devices";
  initialSub?: string;
}

export default function CatalogLayout({
  category,
  initialSub,
}: CatalogLayoutProps) {
  // 🔹 Создаем начальные фильтры на основе initialSub
  const getInitialFilters = () => {
    if (!initialSub) return {};

    const normalized = decodeURIComponent(initialSub).toLowerCase();
    const initialFilters: any = {};

    if (category === "iqos" || category === "devices") {
      initialFilters.brand = [normalized];
    } else if (category === "terea") {
      initialFilters.country = [normalized];
    }

    return initialFilters;
  };

  const {
    filters,
    updateFilters,
    clearFilters,
    updateSearch,
    updateSort,
    updatePage,
  } = useURLFilters(getInitialFilters());

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const hasInitialized = useRef(false);

  // 🔹 Синхронизация initialSub с фильтрами (ТОЛЬКО при первом рендере)
  useEffect(() => {
    if (!initialSub || hasInitialized.current) return;

    const normalized = decodeURIComponent(initialSub).toLowerCase();

    // Получаем текущий фильтр и приводим к нижнему регистру
    const currentFilter =
      category === "terea"
        ? filters.country?.[0]?.toLowerCase()
        : filters.brand?.[0]?.toLowerCase();

    // Применяем фильтр только если он еще не установлен
    if (!currentFilter) {
      if (category === "terea") {
        updateFilters({ ...filters, country: [normalized] });
      } else {
        updateFilters({ ...filters, brand: [normalized] });
      }
    }

    hasInitialized.current = true;
  }, [initialSub, category]); // 🔹 Убрали filters и updateFilters из зависимостей

  // 🔹 Обработчики
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateFilters({ ...filters, page: newPage });
    },
    [filters, updateFilters]
  );

  const handleFiltersChange = useCallback(
    (newFilters: any) => {
      updateFilters(newFilters);
    },
    [updateFilters]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      updateSearch(query);
    },
    [updateSearch]
  );

  const handleSortChange = useCallback(
    (sort: string) => {
      updateSort(sort);
    },
    [updateSort]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
    // Сбрасываем флаг при очистке фильтров
    hasInitialized.current = false;
  }, [clearFilters]);

  // 🔹 Быстрые фильтры
  const getQuickFilterOptions = () => {
    switch (category) {
      case "terea":
        return [
          { value: "казахстан", label: "Казахстан" },
          { value: "узбекистан", label: "Узбекистан" },
          { value: "армения", label: "Армения" },
          { value: "индонезия", label: "Индонезия" },
          { value: "польша", label: "Польша" },
          { value: "япония", label: "Япония" },
          { value: "швейцария", label: "Швейцария" },
          { value: "европа", label: "Европа" },
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

  const handleQuickFilter = useCallback(
    (value: string) => {
      const currentFilters = { ...filters };
      const currentValues: string[] = currentFilters[quickFilterKey] || [];
      const isActive = currentValues.some(
        (v) => v.toLowerCase() === value.toLowerCase()
      );

      let newValues: string[];
      if (isActive) newValues = [];
      else newValues = [value];

      if (newValues.length === 0) delete currentFilters[quickFilterKey];
      else currentFilters[quickFilterKey] = newValues;

      updateFilters(currentFilters);
    },
    [filters, quickFilterKey, updateFilters]
  );

  const isQuickFilterActive = (value: string) =>
    filters[quickFilterKey]?.some(
      (v: string) => v.toLowerCase() === value.toLowerCase()
    ) || false;

  const activeFiltersCount = useCallback(() => {
    const keys = Object.keys(filters).filter(
      (k) => !["search", "sort", "page"].includes(k)
    );
    return keys.length;
  }, [filters]);

  return (
    <section className="hero-container">
      <div className="second_page_header">
        <h1>
          Каталог
          {category && ` ${category.toUpperCase()}`}
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

          <div className={styles.content}>
            <Toolbar
              onMobileFiltersToggle={() =>
                setIsMobileFiltersOpen(!isMobileFiltersOpen)
              }
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount()}
              searchQuery={filters.search || ""}
              onSearchChange={handleSearchChange}
              sortBy={filters.sort || "default"}
              onSortChange={handleSortChange}
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
              onPageChange={handlePageChange}
              onFiltersReset={handleClearFilters}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

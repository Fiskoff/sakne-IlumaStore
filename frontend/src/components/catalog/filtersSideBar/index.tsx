"use client";

import { filterConfigs } from "@/libs/catalog/filters-config";
import FilterGroup from "./filters/filterGroup/filterGroup";
import styles from "./index.module.scss";

interface FiltersSidebarProps {
  category: string;
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export default function FiltersSidebar({
  category,
  filters,
  onFiltersChange,
}: FiltersSidebarProps) {
  const config = filterConfigs[category as keyof typeof filterConfigs];
  if (!config) return null;

  const handleFilterChange = (id: string, value: any) => {
    onFiltersChange({ ...filters, [id]: value });
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.clear}>
        <span>Фильтры:</span>
        <button
          onClick={() => onFiltersChange({})}
          className={styles.clear_button}
        >
          Сбросить все
        </button>
      </div>
      {config.filters.map((filter, index) => (
        <FilterGroup
          key={filter.id}
          filter={filter}
          value={
            filters[filter.id] ||
            (filter.type === "range"
              ? { min: filter.min, max: filter.max }
              : [])
          }
          onChange={(value) => handleFilterChange(filter.id, value)}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}

import styles from "./index.module.scss";

interface ToolbarProps {
  onMobileFiltersToggle?: () => void;
  onClearFilters?: () => void;
  activeFiltersCount?: number;
}

export default function Toolbar({ onMobileFiltersToggle }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarMain}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Поиск товаров..."
            className={styles.searchInput}
          />
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none">
            <path
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className={styles.controls}>
          <select className={styles.select}>
            <option value="default">Сортировка</option>
            <option value="price-asc">По цене ↑</option>
            <option value="price-desc">По цене ↓</option>
          </select>

          {onMobileFiltersToggle && (
            <button
              className={styles.mobileFilterBtn}
              onClick={onMobileFiltersToggle}
            >
              <span>Фильтры</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

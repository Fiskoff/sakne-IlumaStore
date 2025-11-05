import { CheckboxFilter as CheckboxFilterType } from "@/types/catalog/types";
import styles from "./CheckboxFilter.module.scss";
import { useState } from "react";
import Image from "next/image";

interface CheckboxFilterProps {
  filter: CheckboxFilterType;
  value: string[];
  onChange: (value: string[]) => void;
  isCollapsible?: boolean;
  singleSelect?: boolean; // 👈 Добавляем флаг для режима одного выбора
}

export default function CheckboxFilter({
  filter,
  value,
  onChange,
  isCollapsible = false,
  singleSelect = false, // 👈 значение по умолчанию — множественный выбор
}: CheckboxFilterProps) {
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);

  const handleChange = (optionValue: string, checked: boolean) => {
    if (singleSelect) {
      // 👇 Если режим одиночного выбора — выбираем только один пункт
      if (checked) {
        onChange([optionValue]);
      } else {
        onChange([]);
      }
    } else {
      // 👇 Стандартное поведение (множественный выбор)
      if (checked) {
        onChange([...value, optionValue]);
      } else {
        onChange(value.filter((v) => v !== optionValue));
      }
    }
  };

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={styles.filter}>
      <div className={styles.filterHeader} onClick={toggleExpanded}>
        <div className={styles.headerContent}></div>
        {isCollapsible && (
          <svg
            className={`${styles.filterIcon} ${
              isExpanded ? styles.expanded : ""
            }`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div
        className={`${styles.filterOptions} ${
          isCollapsible && !isExpanded ? styles.collapsed : ""
        }`}
      >
        {filter.options.map((option) => (
          <label key={option.value} className={styles.filterLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={value.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              disabled={option.count === 0}
            />
            <span className={styles.optionContent}>
              <span className={styles.optionLabel}>{option.label}</span>
              {option.count !== undefined && (
                <span className={styles.optionCount}>({option.count})</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

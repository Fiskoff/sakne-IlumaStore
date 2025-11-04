"use client";
import { MultiSelectFilter as MultiSelectFilterType } from "@/types/catalog/types";
import styles from "./MultiSelectFilter.module.scss";

interface MultiSelectFilterProps {
  filter: MultiSelectFilterType;
  value: string[];
  onChange: (value: string[]) => void;
}

export default function MultiSelectFilter({
  filter,
  value,
  onChange,
}: MultiSelectFilterProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className={styles.filter}>
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
  );
}

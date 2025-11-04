"use client";

import { useState, useEffect } from "react";
import { RangeFilter as RangeFilterType } from "@/types/catalog/types";
import styles from "./RangeFilter.module.scss";

interface RangeFilterProps {
  filter: RangeFilterType;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
}

export default function RangeFilter({
  filter,
  value,
  onChange,
}: RangeFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: { min: number; max: number }) => {
    setLocalValue(newValue);
    onChange(newValue); // Без дебаунса
  };

  const formatValue = (val: number) => {
    return `${val.toLocaleString()} ${filter.unit || ""}`;
  };

  const rangeLeft =
    ((localValue.min - filter.min) / (filter.max - filter.min)) * 100;
  const rangeRight =
    ((localValue.max - filter.min) / (filter.max - filter.min)) * 100;

  return (
    <div className={styles.filter}>
      <div className={styles.valuesDisplay}>
        <span className={styles.value}>{formatValue(localValue.min)}</span>
        <span className={styles.value}>{formatValue(localValue.max)}</span>
      </div>

      {/* <div className={styles.inputsContainer}>
        <input
          type="number"
          className={styles.numberInput}
          min={filter.min}
          max={filter.max}
          value={localValue.min}
          onChange={(e) =>
            handleChange({
              ...localValue,
              min: Math.min(Number(e.target.value), localValue.max),
            })
          }
          placeholder="Мин"
        />
        <span className={styles.separator}>-</span>
        <input
          type="number"
          className={styles.numberInput}
          min={filter.min}
          max={filter.max}
          value={localValue.max}
          onChange={(e) =>
            handleChange({
              ...localValue,
              max: Math.max(Number(e.target.value), localValue.min),
            })
          }
          placeholder="Макс"
        />
      </div> */}

      <div className={styles.slidersContainer}>
        <div className={styles.sliderTrack} />
        <div
          className={styles.sliderRange}
          style={{
            left: `${rangeLeft}%`,
            right: `${100 - rangeRight}%`,
          }}
        />
        <input
          type="range"
          className={styles.slider}
          min={filter.min}
          max={filter.max}
          step={filter.step}
          value={localValue.min}
          onChange={(e) =>
            handleChange({
              ...localValue,
              min: Math.min(Number(e.target.value), localValue.max),
            })
          }
        />
        <input
          type="range"
          className={styles.slider}
          min={filter.min}
          max={filter.max}
          step={filter.step}
          value={localValue.max}
          onChange={(e) =>
            handleChange({
              ...localValue,
              max: Math.max(Number(e.target.value), localValue.min),
            })
          }
        />
      </div>
    </div>
  );
}

"use client";

import { Filter } from "@/types/catalog/types";
import CheckboxFilter from "../CheckboxFilter/CheckboxFilter";
import RangeFilter from "../RangeFilter/RangeFilter";
import MultiSelectFilter from "../MultiSelectFilter/MultiSelectFilter";
import ColorFilter from "../ColorFilter/ColorFilter";
import styles from "./filterGroup.module.scss";
import Image from "next/image";
import { useState } from "react";

interface FilterGroupProps {
  filter: Filter;
  value: any;
  onChange: (value: any) => void;
  isFirst?: boolean;
}

export default function FilterGroup({
  filter,
  value,
  onChange,
  isFirst = false,
}: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(isFirst); // Первый фильтр открыт по умолчанию

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderFilter = () => {
    switch (filter.type) {
      case "checkbox":
        return (
          <CheckboxFilter
            filter={filter}
            value={value || []}
            onChange={onChange}
          />
        );

      case "range":
        return (
          <RangeFilter
            filter={filter}
            value={value || { min: filter.min, max: filter.max }}
            onChange={onChange}
          />
        );

      case "multiselect":
        return (
          <MultiSelectFilter
            filter={filter}
            value={value || []}
            onChange={onChange}
          />
        );

      case "color":
        return (
          <ColorFilter
            filter={filter}
            value={value || []}
            onChange={onChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`${styles.filterGroup} ${isExpanded ? styles.expanded : ""}`}
    >
      <div className={styles.filterGroupHeader} onClick={toggleExpanded}>
        <h3>{filter.label}</h3>
        <Image
          src="/header/arrow.svg"
          alt="arrow"
          width={15}
          height={15}
          className={`${styles.arrow} ${isExpanded ? styles.expanded : ""}`}
        />
      </div>

      <div
        className={`${styles.filterContent} ${
          isExpanded ? styles.expanded : ""
        }`}
      >
        {renderFilter()}
      </div>
    </div>
  );
}

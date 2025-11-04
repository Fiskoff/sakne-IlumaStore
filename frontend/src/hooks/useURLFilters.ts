// hooks/useURLFilters.ts
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function useURLFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    const params: any = {};
    searchParams.forEach((value, key) => {
      try {
        // Пробуем распарсить JSON, если не получается - оставляем как строку
        const parsedValue = JSON.parse(value);
        // Игнорируем null, undefined и пустые массивы
        if (
          parsedValue !== null &&
          parsedValue !== undefined &&
          !(Array.isArray(parsedValue) && parsedValue.length === 0)
        ) {
          params[key] = parsedValue;
        }
      } catch {
        // Если не JSON, то проверяем что это не пустая строка
        if (value.trim() !== "") {
          params[key] = value;
        }
      }
    });
    setFilters(params);
  }, [searchParams]);

  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    const params = new URLSearchParams();

    // Сохраняем текущую страницу (если есть)
    const page = searchParams.get("page");
    if (page) params.set("page", page);

    // Добавляем только непустые фильтры
    for (const [key, value] of Object.entries(newFilters)) {
      if (value !== undefined && value !== null) {
        // Проверяем пустые массивы и объекты
        if (Array.isArray(value) && value.length === 0) {
          continue; // Пропускаем пустые массивы
        }

        if (typeof value === "object" && Object.keys(value).length === 0) {
          continue; // Пропускаем пустые объекты
        }

        if (typeof value === "string" && value.trim() === "") {
          continue; // Пропускаем пустые строки
        }

        // Сериализуем в JSON только объекты и массивы
        const serializedValue =
          typeof value === "object" ? JSON.stringify(value) : String(value);

        params.set(key, serializedValue);
      }
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({});

    const params = new URLSearchParams();
    const page = searchParams.get("page");

    if (page) params.set("page", page);

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // 🔹 Функция для обновления поиска
  const updateSearch = (searchQuery: string) => {
    const currentFilters = { ...filters };

    if (searchQuery.trim()) {
      currentFilters.search = searchQuery;
    } else {
      delete currentFilters.search;
    }

    // Сбрасываем страницу при поиске
    currentFilters.page = 1;

    updateFilters(currentFilters);
  };

  // 🔹 Функция для обновления сортировки
  const updateSort = (sortBy: string) => {
    const currentFilters = { ...filters };

    if (sortBy && sortBy !== "default") {
      currentFilters.sort = sortBy;
    } else {
      delete currentFilters.sort;
    }

    updateFilters(currentFilters);
  };

  return {
    filters,
    updateFilters,
    clearFilters,
    updateSearch,
    updateSort,
  };
}

// hooks/useURLFilters.ts
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export function useURLFilters(initialFilters: any = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    const params: any = {};
    searchParams.forEach((value, key) => {
      try {
        const parsedValue = JSON.parse(value);
        if (
          parsedValue !== null &&
          parsedValue !== undefined &&
          !(Array.isArray(parsedValue) && parsedValue.length === 0)
        ) {
          params[key] = parsedValue;
        }
      } catch {
        if (value.trim() !== "") {
          params[key] = value;
        }
      }
    });

    console.log("🔗 URL params:", params);
    console.log("🔗 Initial filters:", initialFilters);

    // 🔹 Объединяем фильтры из URL с начальными фильтрами
    const mergedFilters = { ...initialFilters, ...params };
    console.log("🔗 Merged filters:", mergedFilters);

    setFilters(mergedFilters);
  }, [searchParams, initialFilters]);

  const updateFilters = useCallback(
    (newFilters: any) => {
      console.log("🔄 Updating filters:", newFilters);
      setFilters(newFilters);
      const params = new URLSearchParams();

      const page = searchParams.get("page");
      if (page) params.set("page", page);

      for (const [key, value] of Object.entries(newFilters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value) && value.length === 0) continue;
          if (typeof value === "object" && Object.keys(value).length === 0)
            continue;
          if (typeof value === "string" && value.trim() === "") continue;

          const serializedValue =
            typeof value === "object" ? JSON.stringify(value) : String(value);
          params.set(key, serializedValue);
        }
      }

      console.log("🔗 New URL params:", params.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    const params = new URLSearchParams();
    const page = searchParams.get("page");
    if (page) params.set("page", page);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const updateSearch = useCallback(
    (searchQuery: string) => {
      const currentFilters = { ...filters };
      if (searchQuery.trim()) {
        currentFilters.search = searchQuery;
      } else {
        delete currentFilters.search;
      }
      currentFilters.page = 1;
      updateFilters(currentFilters);
    },
    [filters, updateFilters]
  );

  const updateSort = useCallback(
    (sortBy: string) => {
      const currentFilters = { ...filters };
      if (sortBy && sortBy !== "default") {
        currentFilters.sort = sortBy;
      } else {
        delete currentFilters.sort;
      }
      updateFilters(currentFilters);
    },
    [filters, updateFilters]
  );

  const updatePage = useCallback(
    (page: number) => {
      const currentFilters = { ...filters };
      if (page > 1) {
        currentFilters.page = page;
      } else {
        delete currentFilters.page;
      }
      updateFilters(currentFilters);
    },
    [filters, updateFilters]
  );

  return {
    filters,
    updateFilters,
    clearFilters,
    updateSearch,
    updateSort,
    updatePage,
  };
}

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
        params[key] = JSON.parse(value);
      } catch {
        params[key] = value;
      }
    });
    setFilters(params);
  }, [searchParams]);

  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    const params = new URLSearchParams(window.location.search);

    // сохраняем текущую страницу (если есть)
    const page = params.get("page");

    // очищаем старые фильтры
    params.forEach((_, key) => {
      if (key !== "page") params.delete(key);
    });

    // добавляем новые фильтры
    for (const [key, value] of Object.entries(newFilters)) {
      if (value !== undefined && value !== null) {
        params.set(key, JSON.stringify(value));
      }
    }

    // возвращаем page (если был)
    if (page) params.set("page", page);

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({});

    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");

    const newParams = new URLSearchParams();
    if (page) newParams.set("page", page);

    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  return { filters, updateFilters, clearFilters };
}

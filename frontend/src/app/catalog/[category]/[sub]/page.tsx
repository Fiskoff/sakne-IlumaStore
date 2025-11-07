// app/catalog/[category]/[sub]/page.tsx
import CatalogLayout from "@/components/catalog/catalogLayout";
import ProductsGrid from "@/components/catalog/productsGrid/productsGrid";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ category: "terea" | "iqos" | "devices"; sub: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, sub } = await params;
  const decodedSub = decodeURIComponent(sub);

  const categoryConfig = {
    iqos: {
      name: "IQOS Iluma",
      baseDescription: "Устройства нагрева табака",
    },
    terea: {
      name: "Стики TEREA",
      baseDescription: "Табачные стики для нагревания",
    },
    devices: {
      name: "Аксессуары IQOS",
      baseDescription: "Аксессуары и комплектующие",
    },
  };

  const config = categoryConfig[category] || {
    name: "Товары",
    baseDescription: "Товары для нагрева табака",
  };

  // Создаем читабельные названия для подкатегорий
  const subCategoryNames: Record<string, string> = {
    // TEREA - страны
    япония: "Стики Terea Япония",
    казахстан: "Стики Terea Казахстан",
    швейцария: "Стики Terea Швейцария",
    армения: "Стики Terea Армения",
    узбекистан: "Стики Terea Узбекистан",
    индонезия: "Стики Terea Индонезия",
    европа: "Стики Terea Европа",

    // IQOS - бренды
    one: "Iqos Iluma One",
    onei: "Iqos Iluma I One",
    standart: "Iqos Iluma Standart",
    standarti: "Iqos Iluma I Standart",
    prime: "Iqos Iluma Prime",
    primei: "Iqos Iluma I Prime",
  };

  const subDisplayName =
    subCategoryNames[decodedSub.toLowerCase()] || decodedSub;

  return {
    title: `${subDisplayName} - Купить в Москве | Iluma-Store`,
    description: `Купить ${subDisplayName} ${config.baseDescription.toLowerCase()} в магазине Iluma-Store. Оригинальная продукция, гарантия качества, доставка по Москве и России.`,
    keywords: `${decodedSub} ${config.name.toLowerCase()}, купить ${decodedSub}, ${
      config.baseDescription
    } ${decodedSub}, оригинальные ${config.name.toLowerCase()}`,
    openGraph: {
      title: `${subDisplayName} | Iluma-Store`,
      description: `Выберите и купите ${subDisplayName} ${config.baseDescription.toLowerCase()}. Оригинальная продукция с доставкой.`,
      type: "website",
      url: `https://iluma-store.ru/catalog/${category}/${sub}`,
      images: [
        {
          url: `/og-${category}-${sub}-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${subDisplayName} - ${config.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${subDisplayName} | Iluma-Store`,
      description: `${subDisplayName} ${config.baseDescription} - оригинальная продукция`,
      images: [`/twitter-${category}-${sub}-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://iluma-store.ru/catalog/${category}/${sub}`,
    },
  };
}

export default async function CatalogSubPage({
  params,
  searchParams,
}: PageProps) {
  const { category, sub } = await params;
  const searchParamsObj = await searchParams;
  const decodedSub = decodeURIComponent(sub);

  const combinedFilters = {
    ...searchParamsObj,
    [category === "terea" ? "country" : "brand"]: decodedSub,
  };

  return (
    <CatalogLayout
      category={category}
      initialSub={sub}
      searchParams={searchParamsObj}
    >
      <ProductsGrid
        category={category}
        filters={combinedFilters}
        paginationMode="pages"
        perPage={12}
      />
    </CatalogLayout>
  );
}

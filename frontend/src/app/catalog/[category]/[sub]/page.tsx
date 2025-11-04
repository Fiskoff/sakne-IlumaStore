import CatalogLayout from "@/components/catalog/catalogLayout";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ category: "terea" | "iqos" | "devices"; sub: string }>;
}

// 🔹 Асинхронно генерируем метаданные
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, sub } = await params; // обязательно await

  const categoryName =
    category === "iqos"
      ? "IQOS Iluma"
      : category === "terea"
      ? "Стики TEREA"
      : "Аксессуары IQOS";

  const subName = decodeURIComponent(sub);

  return {
    title: `${categoryName} ${subName}`,
    description: `Купить ${categoryName} (${subName}) в нашем интернет-магазине. Оригинальные товары IQOS, доставка по Казахстану.`,
    openGraph: {
      title: `${categoryName} — ${subName}`,
      description: `Выберите и купите ${categoryName} (${subName}).`,
      type: "website",
      url: `https://iqos.kz/catalog/${category}/${sub}`,
    },
  };
}

// 🔹 Основная страница
export default async function CatalogSubPage({ params }: PageProps) {
  const { category, sub } = await params;

  return <CatalogLayout category={category} initialSub={sub} />;
}

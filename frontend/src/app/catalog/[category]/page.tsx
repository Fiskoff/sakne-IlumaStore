import CatalogLayout from "@/components/catalog/catalogLayout";

interface CatalogCategoryPageProps {
  params: Promise<{ category: "terea" | "iqos" | "devices" }>;
}

export default async function CatalogCategoryPage({
  params,
}: CatalogCategoryPageProps) {
  const { category } = await params;

  return <CatalogLayout category={category} />;
}

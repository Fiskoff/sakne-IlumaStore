import { Metadata } from "next";
import ProductPage from "@/components/product/productPage/productPage";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductData(slug: string) {
  try {
    const apiUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/products/${slug}`;
    console.log("Fetching product from:", apiUrl);

    const response = await fetch(apiUrl, {
      next: { revalidate: 60 },
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("Product not found (404)");
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const product = await response.json();
    console.log("Product data received:", product);
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  console.log("Generate metadata for slug:", slug);

  const product = await getProductData(slug);

  if (!product) {
    return {
      title: "Товар не найден | Iluma-Store",
    };
  }

  return {
    title: `${product.name} | Iluma-Store`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  console.log("Product page loading for slug:", slug);

  const product = await getProductData(slug);

  if (!product) {
    console.log("Product not found, showing 404");
    notFound();
  }

  console.log("Rendering product page for:", product.name);
  return <ProductPage product={product} />;
}

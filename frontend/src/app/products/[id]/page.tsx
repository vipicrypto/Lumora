import { notFound } from "next/navigation";
import { getProductById, getRelatedProducts, products } from "@/data/products";
import ProductDetails from "./ProductDetails";

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(
    product.id,
    product.category,
    4
  );

  return (
    <ProductDetails
      product={product}
      related={related}
    />
  );
}
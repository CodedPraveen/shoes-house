import CatalogPageClient from "@/components/catalog-page-client";
import { productService } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Arrivals | Shoes House",
  description: "Recently added premium sneakers and latest collections.",
};

export default async function NewArrivalsPage() {
  const products = await productService.getNewArrivals();

  return (
    <CatalogPageClient
      eyebrow="New Arrivals"
      title="Latest releases"
      description="Recently added shoes with new release badges and the freshest collections from Shoes House."
      initialProducts={products}
      showNewBadge
    />
  );
}

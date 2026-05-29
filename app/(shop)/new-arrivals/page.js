import CatalogPageClient from "@/components/catalog-page-client";
import { productService } from "@/services/product-service";

export const metadata = {
  title: "New Arrivals | AERÉ",
  description: "Recently added premium sneakers and latest collections.",
};

export default function NewArrivalsPage() {
  const products = productService.getNewArrivals();

  return (
    <CatalogPageClient
      eyebrow="New Arrivals"
      title="Latest releases"
      description="Recently added shoes with new release badges and the freshest collections from AERÉ."
      initialProducts={products}
      showNewBadge
    />
  );
}

import ProductGrid from "@/components/product-grid";
import SectionReveal from "@/components/section-reveal";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import SectionHeader from "@/components/jewellery/section-header";
import { productService } from "@/services/product-service";

export default async function NewArrivals() {
  const products = (await productService.getNewArrivals()).slice(0, 4);

  if (!products.length) return null;

  return (
    <SectionReveal className="py-16 sm:py-20">
      <JewelleryContainer>
        <SectionHeader
          title="New Arrivals"
          subtitle="Fresh designs for the season"
          href="/new-arrivals"
          italic
        />
        <ProductGrid products={products} showNewBadge />
      </JewelleryContainer>
    </SectionReveal>
  );
}

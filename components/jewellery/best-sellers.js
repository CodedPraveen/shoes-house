import ProductGrid from "@/components/product-grid";
import SectionReveal from "@/components/section-reveal";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import SectionHeader from "@/components/jewellery/section-header";
import { productService } from "@/services/product-service";

export default async function BestSellers() {
  const products = (await productService.getBestSellers(4));

  if (!products.length) return null;

  return (
    <SectionReveal className="bg-[#f6f3f4] py-16 sm:py-20">
      <JewelleryContainer>
        <SectionHeader
          title="Best Sellers"
          subtitle="Customer favourites"
          href="/products"
          italic
        />
        <ProductGrid products={products} />
      </JewelleryContainer>
    </SectionReveal>
  );
}

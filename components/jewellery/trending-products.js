import ProductCarousel from "@/components/product-carousel";
import SectionReveal from "@/components/section-reveal";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import SectionHeader from "@/components/jewellery/section-header";
import { productService } from "@/services/product-service";

export default async function TrendingProducts() {
  const products = (await productService.getTrending()).slice(0, 8);

  if (!products.length) return null;

  return (
    <SectionReveal className="py-16 sm:py-20">
      <JewelleryContainer>
        <SectionHeader
          title="Trending Collection"
          subtitle="Most loved this season"
          href="/trending"
          italic
        />
        <ProductCarousel products={products} />
      </JewelleryContainer>
    </SectionReveal>
  );
}

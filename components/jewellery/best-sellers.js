import ProductGrid from "@/components/product-grid";
import SectionReveal from "@/components/section-reveal";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import SectionHeader from "@/components/jewellery/section-header";
import { productService } from "@/services/product-service";
import ResponsiveProductGrid from "@/components/jewellery/responsive-product-grid";

export const revalidate = 300;

// export default async function BestSellers() {
//   const products = await productService.getBestSellers(8);
export default function BestSellers({ products }) {
  if (!products.length) return null;

  return (
    <SectionReveal className="bg-[#f6f3f4] py-16 sm:py-10">
      <JewelleryContainer>
        <SectionHeader
          title="Best Sellers"
          subtitle="Customer favourites"
          href="/products"
          italic
        />
        {/* <ProductGrid products={visibleProducts} /> */}
        <ResponsiveProductGrid
          products={products}
          mobile={4}
          tablet={6}
          desktop={8}
        />
      </JewelleryContainer>
    </SectionReveal>
  );
}

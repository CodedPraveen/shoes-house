import ProductGrid from "@/components/product-grid";
import SectionReveal from "@/components/section-reveal";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import SectionHeader from "@/components/jewellery/section-header";
// import { productService } from "@/services/product-service";
import ResponsiveProductGrid from "@/components/jewellery/responsive-product-grid";

export const revalidate = 300;

// export default async function NewArrivals() {
  // const products = (await productService.getNewArrivals()).slice(0, 6);

  // const products = await productService.getNewArrivals(8);
export default function NewArrivals({ products, title = "New Arrivals", subtitle = "Fresh designs for the season" }) {
  if (!products.length) return null;

  return (
    <SectionReveal className="py-16 sm:py-10">
      <JewelleryContainer>
        <SectionHeader
          title={title}
          subtitle={subtitle}
          href="/new-arrivals"
          italic
        />
        {/* <ProductGrid products={products} showNewBadge /> */}
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

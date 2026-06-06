import Navbar from "@/components/navbar";
import SearchModal from "@/components/search-modal";
import SiteFooter from "@/components/site-footer";

export default function ShopShell({ children, allProducts = [] }) {
  return (
    <>
      <Navbar />
      <SearchModal allProducts={allProducts} />
      {children}
      <SiteFooter />
    </>
  );
}

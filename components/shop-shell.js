import NavbarServer from "@/components/navbar-server";
import SearchModal from "@/components/search-modal";
import SiteFooter from "@/components/site-footer";

export default function ShopShell({ children }) {


  
  return (
    <>
      <NavbarServer />
      <SearchModal />
      {children}
      <SiteFooter />
    </>
  );
}
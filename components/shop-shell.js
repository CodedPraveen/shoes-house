import NavbarServer from "@/components/navbar-server";
import SearchModal from "@/components/search-modal";
import SiteFooter from "@/components/site-footer";
import dynamic from "next/dynamic";

export default function ShopShell({ children }) {

  const SearchModal = dynamic(
    () => import("@/components/search-modal"),
    { ssr: false }
  );
  
  return (
    <>
      <NavbarServer />
      <SearchModal />
      {children}
      <SiteFooter />
    </>
  );
}
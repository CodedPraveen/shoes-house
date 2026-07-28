// import NavbarServer from "@/components/navbar-server";
// import SearchModal from "@/components/search-modal";
// import SiteFooter from "@/components/site-footer";
// import { usePathname } from "next/navigation";

// const pathname = usePathname();

// const collection = pathname.startsWith("/jewellery")
//   ? "JEWELLERY"
//   : "SHOES";
// export default function ShopShell({
//   children,
//   collection,
// }) {
//   return (
//     <>
//       <NavbarServer collection={collection} />
//       <SearchModal />
//       {children}
//       <SiteFooter />
//     </>
//   );
// }

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
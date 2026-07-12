"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/newsletters-email", label: "Newsletters" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
      <aside className="sticky top-0 h-screen w-56 shrink-0 border-r border-black/10 bg-zinc-50 p-6 overflow-y-auto">
      <div className="text-sm font-semibold tracking-[0.2em]">

        <Link href="/admin">
          Shoes House
        </Link>
        <p className="mt-1 text-xs text-black/45">Admin</p>
      </div>
      <nav className="mt-8 space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block no54123-xl px-4 py-2.5 text-sm transition ${
                active
                  ? "bg-black text-white"
                  : "text-black/70 hover:bg-black/5 hover:text-black"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Boxes, LayoutDashboard, Mail, Menu, Package, ShoppingBag, Users, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/new-admin", icon: LayoutDashboard },
  { label: "Orders", href: "/new-admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/new-admin/products", icon: Package },
  { label: "Inventory", href: "/new-admin/inventory", icon: Boxes },
  { label: "Customers", href: "/new-admin/users", icon: Users },
  { label: "Newsletter", href: "/new-admin/newsletters-email", icon: Mail },
];

function Navigation({ pathname, onNavigate }) {
  return (
    <nav className="mt-8 space-y-1" aria-label="New admin navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/new-admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function NewAdminShell({ children, adminName, adminEmail }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-slate-950 p-5 lg:block">
        <Link href="/new-admin" className="flex items-center gap-3 text-white">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-500"><BarChart3 className="size-5" aria-hidden="true" /></span>
          <span><span className="block text-sm font-semibold">Post Mart</span><span className="block text-xs text-white/45">Operations console</span></span>
        </Link>
        <Navigation pathname={pathname} />
        <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/10 p-3 text-white">
          <p className="truncate text-sm font-medium">{adminName || "Administrator"}</p>
          <p className="truncate text-xs text-white/45">{adminEmail}</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:ml-64 lg:px-8">
        <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden" aria-label="Open admin navigation"><Menu className="size-5" /></button>
        <p className="hidden text-sm font-medium text-slate-500 sm:block">Store operations</p>
        <div className="flex items-center gap-3"><span className="hidden text-sm text-slate-600 sm:block">{adminName || "Admin"}</span><span className="grid size-9 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">{(adminName || adminEmail || "A").slice(0, 1).toUpperCase()}</span></div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close admin navigation" className="absolute inset-0 bg-slate-950/55" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[min(19rem,88vw)] bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between text-white"><span className="font-semibold">Post Mart Admin</span><button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-xl bg-white/10" aria-label="Close navigation"><X className="size-5" /></button></div>
            <Navigation pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <main className="p-4 sm:p-6 lg:ml-64 lg:p-8 xl:p-10">{children}</main>
    </div>
  );
}

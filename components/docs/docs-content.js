"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

const sections = [
  {
    id: "overview",
    title: "1. Overview",
    summary: "Post Mart is a JavaScript e-commerce application for shoes and jewellery.",
    items: [
      "Customer flows include catalog browsing, search and filters, product details, cart, Buy Now, addresses, checkout, payments, wishlists, orders, invoices, and shipment tracking.",
      "Operations flows include product maintenance, order fulfilment, COD call confirmation, India Post tracking, inventory visibility, customers, and newsletter subscribers.",
      "The repository is production-oriented, but the current deployment state was not verified from source code.",
    ],
  },
  {
    id: "architecture",
    title: "2. Architecture",
    summary: "The App Router connects UI boundaries to server actions and route handlers, then services, Prisma, and Supabase PostgreSQL.",
    code: "Browser\n  → Next.js App Router pages and components\n  → Server Components / Server Actions / API routes\n  → services/*\n  → Prisma\n  → Supabase PostgreSQL\n\nExternal: Clerk · Cloudinary · Razorpay · AfterShip · Google Maps · Redis (optional)",
    items: [
      "app/ owns route groups, pages, layouts, route handlers, and webhooks.",
      "components/ owns storefront, existing admin, new-admin, and shared UI.",
      "actions/ owns remotely callable server functions and their authentication boundaries.",
      "services/ owns database-backed business logic and third-party integrations.",
      "lib/ owns Prisma setup, authorization, validation, cache, rate limiting, mapping, and shared helpers.",
      "prisma/ contains the schema, migrations, and catalog/category seed. public/ contains static assets.",
    ],
  },
  {
    id: "tech-stack",
    title: "3. Tech Stack",
    summary: "Versions below come from package.json, not assumptions.",
    items: [
      "Next.js 16.2.6, React and React DOM 19.2.4, JavaScript, App Router.",
      "Prisma Client and CLI 6.19.0 with PostgreSQL/Supabase connection URLs.",
      "Clerk 7.4.2 and Svix 1.95.1 for identity and Clerk webhook verification.",
      "Cloudinary 2.10.0, Razorpay 2.9.6, Axios 1.18.1, and ioredis 5.11.1.",
      "Tailwind CSS 4, Framer Motion 12.40.0, Lucide React 1.18.0, Vercel Analytics, and Speed Insights.",
    ],
  },
  {
    id: "authentication",
    title: "4. Authentication & Authorization",
    summary: "Clerk authenticates customers; explicit trusted role data authorizes administrators.",
    code: "/new-admin/*\n  → server-side auth()\n  → logged out: /sign-in?redirect_url=<safe new-admin path>\n  → signed in: Clerk publicMetadata.role or server ADMIN_EMAILS\n  → non-admin: notFound()\n  → admin: render protected layout",
    items: [
      "Customer server actions derive the Clerk identity server-side and map it to the Prisma User record.",
      "The existing /admin layout remains unchanged and uses the pre-existing isAdminUser helper.",
      "The /new-admin layout never renders Clerk SignIn as a gate. It distinguishes 401 authentication failure from 403 authorization failure.",
      "ADMIN_URL is normalized as a local path and is used only for routing, never as proof of administrator status.",
      "Sensitive new-admin server actions call requireAdmin themselves; the order export route independently returns 401 or 403.",
    ],
  },
  {
    id: "database",
    title: "5. Database",
    summary: "Prisma models commerce state, immutable order snapshots, and operational audit records.",
    items: [
      "User: unique clerkId and email, role, soft deletion, and relations to addresses, cart, wishlist, orders, reviews, and checkout sessions.",
      "Category: unique slug, ProductCollection, parent/children hierarchy, sort order, and products.",
      "Product: unique slug, price, catalog flags, aggregate stock, category, collection, images, colors, sizes, variants, reviews, cart items, and order items.",
      "ProductVariant: unique SKU plus unique product/color/size; variant stock, active state, and InventoryMovement history.",
      "ProductImage: URL, alt text, sortOrder, hover flag, soft deletion, and owning product. No Cloudinary public ID column exists.",
      "Cart/CartItem and Wishlist use user/product relations; Wishlist and ProductVariant include compound uniqueness constraints.",
      "CheckoutSession/CheckoutSessionItem snapshot checkout lines and use CART or BUY_NOW mode.",
      "Order/OrderItem/Payment snapshot fulfilment and payment data; TrackingCheckpoint stores carrier events.",
      "NewsletterSubscriber has a unique email. Review is unique per user/product. WebhookEvent records payment webhook outcomes.",
      "Enums: ProductCollection, OrderStatus, PaymentStatus, CheckoutSessionStatus, CheckoutSessionMode, InventoryMovementType, and WebhookLogStatus.",
    ],
  },
  {
    id: "products",
    title: "6. Products & Categories",
    summary: "Products belong to a parent collection and one seeded child category.",
    items: [
      "Parent collections are Shoes (SHOES) and Jewellery (JEWELLERY).",
      "Seeded shoe children: Footwear, Men, Women, Boys, Sports, and Casual.",
      "Seeded jewellery children: Necklaces, Earrings, Rings, Bracelets, Mangalsutra, Bangles, Anklets, and Pendants.",
      "product-admin-service creates and updates the product, image ordering, color/size records, variants, SKU values, and aggregate stock.",
      "Initial positive variant stock creates RESTOCK InventoryMovement rows.",
      "Products are soft-deleted; product reads filter deleted records through shared Prisma helpers.",
    ],
  },
  {
    id: "cloudinary",
    title: "7. Product Images & Cloudinary",
    summary: "Both admin product experiences use the same server-side Cloudinary service.",
    code: "Device JPG/PNG/WEBP\n  → uploadNewAdminProductImageAction\n  → imageUploadService.uploadFile/uploadBuffer\n  → CLOUDINARY_UPLOAD_FOLDER (fallback: aere/products)\n  → secure_url + public_id\n  → createProductAction/updateProductAction\n  → ProductImage(url, sortOrder, isHover)",
    items: [
      "Cloudinary credentials are configured only in services/upload/image-upload-service.js; API secrets are never sent to the browser.",
      "New-admin accepts local JPG, PNG, and WEBP files up to 10 MB each and uploads them in selection order.",
      "The first URL has sortOrder 0 and remains the primary image. The second image is marked as the hover image by current mapping rules.",
      "The upload action returns secure URL and public ID. ProductImage stores the URL only because the schema has no publicId field.",
      "On edit, existing URLs are retained unless explicitly removed; retained ProductImage rows keep their IDs and ordering is reconciled.",
      "Newly introduced product URLs must be HTTPS Cloudinary delivery URLs for the configured cloud. There is no URL-entry field in new-admin.",
      "Removed database images are soft-deleted, but their Cloudinary assets are not currently destroyed during a successful edit.",
    ],
  },
  {
    id: "cart-checkout",
    title: "8. Cart & Checkout",
    summary: "Cart checkout and Buy Now share validation but deliberately use separate checkout modes.",
    code: "CART → all active cart lines → CheckoutSession(CART) → payment/order → clear cart\nBUY_NOW → one selected variant → CheckoutSession(BUY_NOW) → payment/order → leave cart unchanged",
    items: [
      "Guests use client-side cart state; signed-in users use Prisma-backed cart actions and services.",
      "Saved addresses are fetched by authenticated user ownership; manual addresses pass server validation.",
      "Online checkout creates a 30-minute CheckoutSession and Razorpay order.",
      "COD creates an Order and pending Payment record directly. Current COD inventory handling is listed under Known Issues.",
    ],
  },
  {
    id: "payments",
    title: "9. Payments",
    summary: "Razorpay signatures, captured status, amount matching, ownership, idempotency, and webhooks protect online fulfilment.",
    items: [
      "The server creates Razorpay orders; only the public key ID is returned to checkout UI.",
      "Browser success is verified with the Razorpay signature and a server-side payment fetch before fulfilment.",
      "The Razorpay webhook verifies x-razorpay-signature and records event outcomes for idempotency and diagnostics.",
      "Paid fulfilment atomically creates Order/Payment, decrements stock, creates SALE movements, completes the session, and clears CART-mode carts.",
      "PaymentStatus supports PENDING, PAID, FAILED, and REFUNDED. COD is stored as a pending payment method until operational completion.",
      "Refund service logic exists, but no admin refund UI is wired.",
    ],
  },
  {
    id: "orders",
    title: "10. Orders",
    summary: "Orders preserve prices, product data, shipping data, payment links, and fulfilment state.",
    items: [
      "Order numbers use an ORD timestamp/random suffix format and are unique.",
      "Statuses are PENDING, PROCESSING, SHIPPED, DELIVERED, and CANCELLED.",
      "OrderItem snapshots name, image, SKU, price, color, size, and quantity so later catalog edits do not rewrite history.",
      "Invoices are generated as HTML by invoice-service and are available only to the order owner or an admin.",
      "New-admin supports COD confirmation by call, cancellation before tracking, attaching tracking, and refreshing shipment status.",
    ],
  },
  {
    id: "inventory",
    title: "11. Inventory",
    summary: "Stock is stored per active ProductVariant and aggregated onto Product.",
    items: [
      "Paid Razorpay fulfilment uses an atomic updateMany with stock >= quantity, preventing two paid orders from consuming the same last unit.",
      "Every paid decrement records a negative SALE InventoryMovement; restocks, refunds, and admin adjustments have distinct movement types.",
      "Redis locks reduce concurrent checkout work, with safe Redis helpers providing project-specific fallback behavior.",
      "New-admin inventory is currently a read-only, filterable variant view; variant adjustment UI remains planned.",
    ],
  },
  {
    id: "shipping-tracking",
    title: "12. Shipping & Tracking",
    summary: "AfterShip tracks India Post shipments and writes normalized status back to orders.",
    code: "Order → India Post tracking number → AfterShip tracking API\n  → tracking URL/id/status → webhook or manual refresh\n  → Order + TrackingCheckpoint → customer/admin UI",
    items: [
      "Order fields include trackingNumber, trackingStatus, trackingUrl, aftershipTrackingId, shippedAt, deliveredAt, and lastTrackingSync.",
      "The AfterShip client creates and fetches india-post tracking resources.",
      "The webhook checks as-signature-hmac-sha256 with AFTERSHIP_WEBHOOK_SECRET before updating matching orders.",
      "Manual refresh replaces TrackingCheckpoint rows and updates delivered/order status when the carrier reports delivery.",
    ],
  },
  {
    id: "admin",
    title: "13. Admin Panel",
    summary: "The existing /admin system is a separate, established interface and must remain behaviorally unchanged.",
    items: [
      "Routes cover dashboard, products, product create/edit, orders and order details, inventory, users, and newsletter email records.",
      "It uses the existing AdminSidebar, server layout guard, product actions/service, Cloudinary uploader, order components, and tracking actions.",
      "Work on /new-admin must not redesign, reroute, or replace /admin.",
    ],
  },
  {
    id: "new-admin",
    title: "14. New Admin Panel",
    summary: "/new-admin is the newer operations interface with an independent protected layout.",
    items: [
      "Routes currently present: dashboard, products, product create/edit, orders, order detail/export, inventory, users, and newsletter email records.",
      "All child pages inherit the server-side new-admin layout guard, including direct nested-route navigation.",
      "Product mutations reuse admin-product-actions and product-admin-service; local files reuse the shared Cloudinary upload service.",
      "Order mutations use new-admin-order-actions and independently require an administrator.",
      "Read-heavy pages call new-admin-service from protected Server Components; no browser API exposes those service functions directly.",
    ],
  },
  {
    id: "api-actions",
    title: "15. API & Server Actions",
    summary: "Important network boundaries authenticate before returning or mutating sensitive resources.",
    items: [
      "admin-product-actions: admin-only category reads, product CRUD, Cloudinary upload, and failed-upload cleanup; inputs are revalidated in the service layer.",
      "new-admin-order-actions: admin-only COD confirmation, cancellation, tracking attachment, and carrier refresh with order-state checks.",
      "GET /new-admin/orders/export: admin-only CSV; 401 logged out, 403 non-admin.",
      "GET /api/orders/[orderId] and /invoice: authenticated owner or admin; validate the ID before access and authorize before tracking synchronization.",
      "POST /api/webhooks/clerk: verifies Svix signature and synchronizes Prisma users/roles.",
      "POST /api/webhooks/razorpay: verifies payment webhook signature and invokes idempotent fulfilment.",
      "POST /api/webhooks/aftership: verifies the AfterShip HMAC and updates tracking state.",
      "Checkout, cart, wishlist, address, order, review, and geocode actions derive customer identity on the server where authentication is required.",
    ],
  },
  {
    id: "security",
    title: "16. Security",
    summary: "Authentication proves identity; authorization decides whether that identity may access a resource.",
    items: [
      "Never use React state, localStorage, browser role values, hidden fields, query strings, or NEXT_PUBLIC variables as an authorization boundary.",
      "New-admin authorization uses server-side Clerk auth plus trusted Clerk public metadata or the server-only ADMIN_EMAILS allowlist.",
      "Authenticated non-admin visitors receive a 404 boundary for new-admin pages; they are not redirected to the storefront.",
      "Customer order routes enforce owner-or-admin resource authorization and do not synchronize carrier state before authorization.",
      "Safe redirects are restricted to the normalized local new-admin subtree.",
      "Cloudinary, Clerk, database, Razorpay, AfterShip, Redis, and server Google keys remain server-only.",
      "Webhook signatures, rate limits, input validation, amount verification, atomic stock operations, and idempotency provide layered protection.",
    ],
  },
  {
    id: "environment",
    title: "17. Environment Variables",
    summary: "Store values in local/deployment secrets; documentation lists names only.",
    items: [
      "Public/client-safe: NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, NEXT_PUBLIC_CLERK_SIGN_IN_URL, NEXT_PUBLIC_CLERK_SIGN_UP_URL, NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL, NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID, NEXT_PUBLIC_FACEBOOK_PIXEL_ID.",
      "Server-only: DATABASE_URL, DIRECT_URL, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, ADMIN_EMAILS, ADMIN_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_UPLOAD_FOLDER, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, AFTERSHIP_API_KEY, AFTERSHIP_WEBHOOK_SECRET, GOOGLE_GEOCODING_API_KEY, GOOGLE_GEOLOCATION_API_KEY, REDIS_URL, PERF_LOG.",
      "Required new-admin route setting: ADMIN_URL=/new-admin. It is a path, not an authorization secret.",
      "Never create NEXT_PUBLIC_ADMIN_URL or expose CLERK_SECRET_KEY/CLOUDINARY_API_SECRET through a NEXT_PUBLIC name.",
    ],
  },
  {
    id: "development",
    title: "18. Development Setup",
    summary: "Use the scripts defined in package.json.",
    code: "npm install\n# create .env from an example and fill required values\nnpm run setup\nnpm run dev\n\n# focused database commands\nnpm run db:generate\nnpm run db:push\nnpm run db:migrate\nnpm run db:deploy\nnpm run db:seed\nnpm run db:studio",
    items: [
      "npm run setup generates Prisma Client, pushes the development schema, and executes prisma/seed.js.",
      "Use db:push for development schema synchronization and db:deploy for committed production migrations.",
      "npm run lint runs ESLint; npm run build generates Prisma Client and creates the Next.js production build.",
    ],
  },
  {
    id: "deployment",
    title: "19. Deployment",
    summary: "Repository documentation targets Vercel with managed external services, but also lists a generic Node production flow.",
    code: "Git repository → Vercel build\n  → Supabase PostgreSQL\n  → Clerk\n  → Cloudinary\n  → Razorpay\n  → AfterShip\n\nProduction: npm run db:deploy → npm run build → npm run start",
    items: [
      "Configure production and preview environment variables independently.",
      "Register Clerk, Razorpay, and AfterShip webhook URLs against the deployed app and configure their signing secrets.",
      "Do not run db:push as the production migration strategy.",
    ],
  },
  {
    id: "features",
    title: "20. Current Features",
    summary: "Status reflects code present in this repository.",
    items: [
      "[x] Clerk customer authentication and verified user-sync webhook.",
      "[x] Shoe/jewellery category hierarchy, catalog, variants, search/filtering, cart, wishlist, addresses, and Buy Now.",
      "[x] Razorpay checkout, signature verification, webhook idempotency, orders, invoices, and paid-order inventory movements.",
      "[x] COD order creation and new-admin call-confirmation workflow.",
      "[x] Cloudinary device uploads and ordered ProductImage persistence for new-admin.",
      "[x] Existing /admin and protected /new-admin operations areas.",
      "[x] India Post tracking through AfterShip with webhook/manual refresh.",
      "[~] Reviews: model and guarded placeholder action exist; submission UI is planned.",
      "[~] Inventory: atomic paid fulfilment exists; adjustment UI and COD decrement need completion.",
      "[~] Refunds: service foundation exists; admin workflow is not wired.",
    ],
  },
  {
    id: "roadmap",
    title: "21. Feature Plan / Roadmap",
    summary: "Roadmap combines repository ROADMAP.md with direct gaps visible in current architecture.",
    items: [
      "Phase 1 — Stabilization · P0 · Planned: correct COD inventory accounting, add end-to-end tests, harden multi-instance rate limiting, improve image cleanup/error recovery. Dependencies: checkout and deployment environments.",
      "Phase 2 — Core Commerce · P1 · Planned: variant-level stock editing with movement audit, product image reordering, bulk catalog import/export. Dependencies: product/inventory services.",
      "Phase 3 — Customer Experience · P1/P2 · Planned: review submission and display, wishlist polish, stronger order/account notifications, search/filter improvements. Dependencies: Review model and notification provider choice.",
      "Phase 4 — Operations · P1 · Planned: admin refund UI, inventory adjustment tools, tracking exception workflows, reporting, and order workflow polish. Dependencies: refund and inventory services.",
      "Phase 5 — Growth · P2/P3 · Planned: promotions/coupons, analytics, newsletter improvements, and evidence-driven abandoned-cart work. Dependencies: pricing rules, consent, and analytics design.",
      "Production hardening · P1 · Planned: Upstash/Redis rate limiting, pool tuning or Prisma Accelerate, preview/production separation, and a formal security audit.",
    ],
  },
  {
    id: "known-issues",
    title: "22. Known Issues",
    summary: "These gaps remain after the current implementation and should not be mistaken for completed features.",
    items: [
      "P0: COD creation validates available stock but does not atomically decrement it or write a SALE movement, so concurrent/subsequent COD orders can oversell.",
      "P1: Product edit recreates variants; the current delete-first strategy can remove variant movement history through cascade behavior and can conflict with referenced order items.",
      "P1: Successful removal of a ProductImage record does not delete the corresponding Cloudinary asset because public IDs are not persisted.",
      "P1: Rate limiting is in-memory per server instance; it is not a complete multi-region production control.",
      "P2: Refund logic and reviews have service/schema foundations but no finished user/admin workflow.",
      "P2: New-admin inventory is visibility-only and has no variant stock adjustment mutation UI.",
      "No automated test suite was found in the repository; authentication roles and third-party uploads/webhooks require environment-backed integration testing.",
    ],
  },
  {
    id: "project-rules",
    title: "23. Important Project Rules",
    summary: "Read these constraints before changing commerce or operations code.",
    items: [
      "Do not change /admin behavior while working on /new-admin.",
      "Do not bypass server-side authentication or explicit resource authorization.",
      "Derive user/admin identity from Clerk server APIs; never trust a client-provided userId or role.",
      "Keep all secret values server-only and document variable names rather than values.",
      "Reuse services and actions before creating duplicate business or integration layers.",
      "Product images must use the existing Cloudinary service; new-admin must not accept pasted/external URLs.",
      "Keep Prisma access and business rules in existing server/service boundaries rather than duplicating logic in UI components.",
      "Protect sensitive route handlers and server actions independently of page layouts.",
      "Preserve mobile-first behavior and avoid unrelated UI redesigns.",
      "Follow existing App Router, naming, soft-delete, and cache invalidation conventions.",
    ],
  },
];

function searchableText(section) {
  return [section.title, section.summary, section.code, ...(section.items || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function DocsContent() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const visibleSections = deferredQuery
    ? sections.filter((section) => searchableText(section).includes(deferredQuery))
    : sections;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Post Mart engineering</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Project documentation</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Repository-backed guidance for architecture, commerce flows, operations, integrations, security, setup, and planned work. No credentials are included.
          </p>
          <label className="relative mt-6 block max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <span className="sr-only">Search documentation</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search architecture, payments, Cloudinary…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none ring-indigo-200 focus:ring-2"
            />
          </label>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <nav aria-label="Documentation sections" className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {sections.map((section) => (
                <Link key={section.id} href={`#${section.id}`} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                  {section.title}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            <details className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold">Table of contents</summary>
              <nav aria-label="Mobile documentation sections" className="mt-3 grid gap-1 sm:grid-cols-2">
                {sections.map((section) => (
                  <Link key={section.id} href={`#${section.id}`} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                    {section.title}
                  </Link>
                ))}
              </nav>
            </details>

            {visibleSections.length ? visibleSections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 [content-visibility:auto]">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{section.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{section.summary}</p>
                {section.code ? (
                  <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100 sm:text-sm"><code>{section.code}</code></pre>
                ) : null}
                {section.items?.length ? (
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700 sm:text-base">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-500" /><span>{item}</span></li>
                    ))}
                  </ul>
                ) : null}
              </section>
            )) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h2 className="font-semibold">No matching documentation</h2>
                <p className="mt-2 text-sm text-slate-500">Try a broader term such as orders, security, or environment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

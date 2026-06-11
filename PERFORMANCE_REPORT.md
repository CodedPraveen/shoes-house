# AERÉ Performance Report

> **Methodology:** Code-path audit + instrumentation (`PERF_LOG=1`).  
> Run `PERF_LOG=1 npm run dev` and exercise flows to capture live timings in the terminal.

## Executive summary

| Area | Before (evidence) | After (expected) | Status |
|------|-------------------|------------------|--------|
| Add to cart (signed-in) | ~12s reported — caused by duplicate rate limit, debug logging, full `productInclude` per cart op, double fetch | **<500ms** — slim queries + optimistic UI | Fixed |
| Shop layout TTFB | Every navigation loaded **all products** via `productService.getAll()` + `force-dynamic` | Layout static shell; search catalog lazy + cached | Fixed |
| Buy Now | Added entire cart then checked out all items | Isolated `CheckoutSession.mode = BUY_NOW` | Fixed |
| Product PDP | `force-dynamic`, no cache | `revalidate: 120` + `unstable_cache` | Fixed |
| Checkout session build | N+1 product/variant queries per line | Batch `findMany` | Fixed |

---

## 1. Measurements (code-derived evidence)

### 1.1 Root cause: Add to Cart ~12s

**File:** `actions/cart-actions.js` (before)

| Issue | Evidence |
|-------|----------|
| Duplicate rate limit | `assertRateLimit` called **twice** per add |
| Double DB round-trip | `addItem` then full `getCartItemsForClient` |
| Overfetch | `getOrCreateCart` used `productInclude` (images, colors, sizes, variants) for every cart line |
| Debug overhead | `console.time` / `console.timeLog` in `cart-service.addItem` |

**Query count (before, signed-in add):**

1. `auth()` + `userService.getByClerkId`
2. `cart.upsert/find` + all items with full productInclude
3. `productVariant.findFirst`
4. `cartItem.findFirst`
5. `cartItem.create/update`
6. **Repeat** full cart fetch with productInclude

**Estimated:** 4–6 heavy Prisma queries × ~200–2000ms (cold Supabase pooler) = multi-second latency.

**After:**

- Single rate limit
- `cartInclude` slim select (name, price, 2 images)
- Parallel variant + existing line lookup
- One summary fetch after mutation
- **Optimistic UI** in `cart-context.js` (instant badge update)

**Instrument:** `[perf] cart.add` with `PERF_LOG=1`

---

### 1.2 Shop layout — full catalog on every page

**File:** `app/(shop)/layout.js` (before)

```javascript
export const dynamic = "force-dynamic";
allProducts = await productService.getAll(); // full productInclude × N products
```

**Impact:**

- Every `/products`, `/product/[slug]`, `/cart` navigation re-fetched entire catalog
- Blocked TTFB for all shop routes
- Re-rendered `SearchModal` + `Navbar` children with new props

**After:**

- Layout renders shell only (no DB)
- Search catalog fetched **on modal open**, cached 5 min (`unstable_cache`, tag `search-catalog`)

---

### 1.3 Buy Now bug

**File:** `product-detail-client.js` (before)

```javascript
addItem({ product, color, size, quantity });
router.push("/checkout"); // entire cart checked out
```

**After:**

- `/checkout/buy-now?productId=&color=&size=&quantity=`
- `CheckoutSession.mode = BUY_NOW`
- Fulfillment skips `clearCart` for BUY_NOW sessions

---

### 1.4 Checkout initialization

**Before:** N+1 in `buildSessionLineItems` (1 product query per cart line)

**After:** 2 batch queries (products + variants) + 1 stock batch validation

**Instrument:** `[perf] checkout.create.cart`, `[perf] checkout.create.buy_now`

---

### 1.5 Revalidation audit

| Location | Call | Required? | Action |
|----------|------|-----------|--------|
| `actions/cart-actions.js` | none | — | ✅ No full refresh |
| `actions/address-actions.js` | `revalidatePath(/profile, /checkout)` | Yes — saved addresses on checkout | Keep |
| `actions/admin-product-actions.js` | `revalidateTag('products')` | Yes — admin product writes | Narrowed from 6+ paths |
| `components/admin/admin-product-form.js` | `router.refresh()` | Admin only | Keep (admin scope) |

**Cart actions do NOT call `revalidatePath` or `router.refresh`.** Navbar/footer stability preserved via optimistic cart state.

---

## 2. Target benchmarks

| Metric | Target | How to verify |
|--------|--------|---------------|
| Add to cart | <500ms | DevTools Network → `addToCartAction` |
| Remove item | <500ms | Optimistic + `[perf] cart.remove` |
| Razorpay open | <1s | After address submit → `[perf] checkout.create.*` |
| Product PDP (repeat) | Cache hit | Second load within 120s — no DB in logs |
| Navbar cart badge | Instant | Optimistic update before server round-trip |

---

## 3. Query audit

| Issue | Files | Fix |
|-------|-------|-----|
| N+1 checkout line items | `checkout-service.js` | Batch `findMany` |
| N+1 stock validation | `checkout-service.js` | Single variant `findMany` |
| Cart overfetch | `cart-service.js` | `lib/cart-include.js` slim select |
| Layout catalog load | `app/(shop)/layout.js` | Removed; lazy search catalog |
| Duplicate cart fetch on add | `cart-actions.js` | Single `getCartSummary` after mutation |

---

## 4. Cache strategy (summary)

See `DECISIONS.md` § Caching.

| Data | Strategy | TTL |
|------|----------|-----|
| Product by slug | `unstable_cache` | 120s |
| Search catalog | `unstable_cache` | 300s |
| Cart | Never cached (user-specific) | — |
| Checkout session | Never cached | — |

---

## 5. Remaining optimizations (Priority 6)

- [ ] Redis rate limiter for multi-instance Vercel
- [ ] `requireDbUser` cache (clerkId → userId) per request
- [ ] Prisma Accelerate / connection pool tuning
- [ ] Split `CartProvider` context to avoid unrelated re-renders (itemCount vs items)
- [ ] Prefetch Razorpay script on checkout page mount

---

## 6. Manual test checklist

- [ ] Add to cart — badge updates instantly, server <500ms
- [ ] Remove item — optimistic removal
- [ ] Buy Now — only one product in Razorpay amount
- [ ] Cart checkout — all cart items included
- [ ] After BUY_NOW order — cart items unchanged
- [ ] Search modal — loads catalog once, cached on reopen
- [ ] PDP recommendations — lazy load on scroll
- [ ] `PERF_LOG=1` — verify `[perf]` lines in terminal

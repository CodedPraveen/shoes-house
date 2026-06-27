# Shoes House Roadmap

## Completed

- [x] Phase 0–1: Prisma schema, seed, slug URLs, product reads
- [x] Phase 4: Razorpay, orders, invoices, addresses, webhooks
- [x] Pre-Phase 5 hardening: InventoryMovement, webhook idempotency, refunds foundation
- [x] Phase 5: Admin product CRUD, Cloudinary, newsletter
- [x] Performance audit: cart speed, Buy Now isolation, caching, recommendations

## Phase 6 — Reviews

- [ ] Review submission UI (PDP)
- [ ] `submitReviewAction` + Prisma Review
- [ ] Aggregate rating on admin (optional)

## Phase 7 — Admin product polish

- [ ] Variant-level stock edit (RESTOCK movements)
- [ ] Bulk import/export
- [ ] Image reorder in admin

## Phase 8 — Production hardening

- [ ] Redis rate limiting (Upstash)
- [ ] Prisma Accelerate / pool tuning
- [ ] Security audit
- [ ] E2E test suite
- [ ] Vercel preview + production env separation
- [ ] Admin refund UI wired to `refund-service`

## Performance targets (ongoing)

| Metric | Target |
|--------|--------|
| Add to cart | <500ms |
| Remove from cart | <500ms |
| Razorpay open | <1s |
| PDP repeat visit | Cache hit (120s) |

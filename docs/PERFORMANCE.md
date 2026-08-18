# Performance

## Existing strategies

### Catalog caching

- Product-by-slug reads use Next.js caching with a 120-second policy.
- Search catalog reads use a 300-second policy.
- Product mutations invalidate product and search tags and relevant paths.

### Query shaping

- Shared include/select helpers avoid loading every product relation for cart and lightweight views.
- New-admin list services paginate products, variants, orders, users, and subscribers.
- Independent server reads use `Promise.all()` where practical.

### Cart behavior

- Client state provides optimistic interaction.
- Signed-in mutations reconcile with server state.
- Cart data is not treated as a long-lived static cache.

### Checkout concurrency

- Variant-level locks reduce concurrent checkout work when Redis is available.
- Paid fulfillment uses an atomic `updateMany` stock predicate as the final oversell boundary.
- Payment fulfillment is idempotent.

### New-admin authorization

`requireAdmin()` is wrapped with React `cache()` so layout and page guards do not duplicate Clerk work within a request.

## Rate limiting

`lib/rate-limit.js` implements an in-memory sliding window per server process. It protects checkout, admin mutations/uploads, newsletter, geocoding, reviews, and webhooks where called.

This is suitable as a basic single-process safeguard, not a complete multi-region limit. The roadmap calls for a shared Redis/Upstash implementation.

## Instrumentation

- Vercel Analytics and Speed Insights are enabled.
- `PERF_LOG=1` enables project performance logging where instrumented.

## Targets in existing project documents

- Cart mutation perceived latency below 500 ms.
- Razorpay opening below one second.
- Repeat product-detail visits should benefit from catalog cache hits.

## Known performance risks

- Database connectivity/pooling configuration affects every server-rendered data route.
- In-memory rate-limit state is not shared across instances.
- Large new-admin tables depend on pagination and careful selects.
- Remote Google Fonts make clean production builds dependent on network access unless fonts are vendored.
- Middleware convention is deprecated in Next.js 16 and should eventually move to `proxy.js` through a separately tested change.

Do not optimize by weakening authorization, payment verification, ownership checks, or atomic inventory behavior.

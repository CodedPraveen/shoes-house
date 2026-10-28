# Performance

## Existing strategies

- Catalog caching with explicit invalidation.
- Slim Prisma selects/includes for cart and lightweight views.
- Optimistic browser cart updates.
- Parallel independent reads where practical.
- Redis locks around selected checkout/inventory work.
- Atomic database stock predicates remain the final oversell boundary.
- BullMQ worker handles image conversion outside the request path.

## Guest checkout considerations

- Guest cart state is browser-side; validate all lines on the server.
- Avoid loading a full catalog for checkout.
- Fetch only the fields required to price/validate the submitted lines.
- Keep email provider latency outside the payment/order transaction.
- Rate-limit checkout and private-token lookup using a shared store for multi-instance production.

## Rate limiting

The current in-memory limiter is per process and is not sufficient as a shared multi-instance production control. Redis/Upstash-backed limits remain a separate hardening task.

## Safety

Never improve performance by weakening token checks, admin authorization, payment verification, order ownership, or atomic inventory updates.

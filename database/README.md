# Database Layer

PostgreSQL + Prisma (prepared, not connected).

1. Set `DATABASE_URL` in `.env.local`
2. Run `npx prisma migrate dev`
3. Replace `data/catalog.js` reads with `services/product-service.js` Prisma queries

Models defined in `prisma/schema.prisma`: User, Product, Category, Order, OrderItem, Wishlist, Review, Address.

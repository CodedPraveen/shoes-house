# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM dependencies AS source
COPY . .

FROM source AS builder
RUN --mount=type=secret,id=app_env,target=/app/.env,required=true npm run build

FROM dependencies AS production-dependencies
RUN npm prune --omit=dev \
    && npm cache clean --force

FROM base AS nextjs
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
RUN mkdir -p /data/ecommerce/images \
    && chown -R node:node /data/ecommerce/images
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=node:node /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=node:node /app/prisma ./prisma
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]

FROM base AS worker
ENV NODE_ENV=production
RUN mkdir -p /data/ecommerce/images \
    && chown -R node:node /data/ecommerce/images
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=source --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=source --chown=node:node /app/prisma ./prisma
COPY --from=source --chown=node:node /app/lib ./lib
COPY --from=source --chown=node:node /app/queues ./queues
COPY --from=source --chown=node:node /app/schemas ./schemas
COPY --from=source --chown=node:node /app/workers ./workers
USER node
CMD ["npm", "run", "worker:prod"]

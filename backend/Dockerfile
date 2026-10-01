# Build context is the backend/ directory itself (Dokploy "Build Path": backend)
FROM node:22-alpine AS base
RUN apk add --no-cache openssl postgresql-client

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 backend

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY scripts ./scripts

RUN chmod +x ./scripts/start.sh && chown -R backend:nodejs /app

USER backend

ENV PORT=4000
EXPOSE 4000

CMD ["./scripts/start.sh"]

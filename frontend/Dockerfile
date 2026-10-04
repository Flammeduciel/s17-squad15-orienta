# Build context is the frontend/ directory itself (Dokploy "Build Path": frontend)
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# VITE_* variables are baked in at build time, not read at runtime -
# they must be passed as a Docker build argument (Dokploy's "Build
# Arguments", not "Environment Settings").
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
# Public address of the site, used by the SEO and sharing tags of index.html.
ARG VITE_SITE_URL
ENV VITE_SITE_URL=${VITE_SITE_URL}

RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

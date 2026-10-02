# Contexte de compilation : le dossier backend/ lui-même
# (Dokploy, champ « Build Path » : backend)
#
# Le backend est en JavaScript : il n'y a donc aucune étape de compilation.
# L'image installe les dépendances puis copie les sources telles quelles.
FROM node:22-alpine AS base

# postgresql-client fournit `psql`, utilisé par le script de démarrage pour
# appliquer les migrations avant de lancer l'API.
RUN apk add --no-cache openssl postgresql-client

# ---------------------------------------------------------------------------
# Dépendances
# ---------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Seul le manifeste est copié à cette étape : la couche est réutilisée tant que
# les dépendances ne changent pas, indépendamment du code.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------------------------------------------------------------------------
# Image finale
# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# L'API ne tourne jamais en root : un compte dédié, comme sur les autres
# services du projet.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 backend

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./
COPY scripts ./scripts

RUN chmod +x ./scripts/start.sh && chown -R backend:nodejs /app

USER backend

ENV PORT=4000
EXPOSE 4000

CMD ["./scripts/start.sh"]

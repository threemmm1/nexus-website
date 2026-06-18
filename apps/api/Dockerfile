# syntax=docker/dockerfile:1

# Build context is the monorepo root (see .dockerignore at repo root):
#   docker build -f apps/api/Dockerfile -t vesioh-api .

# ── deps ──────────────────────────────────────────────────────────────────────
# Install the full workspace so npm can resolve the @vesioh/* graph.
FROM node:20-slim AS deps
WORKDIR /repo
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY packages/config/package.json packages/config/
RUN npm ci

# ── build ─────────────────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /repo
COPY packages packages
COPY apps/api apps/api
RUN npm run db:generate -w @vesioh/api \
  && npm run build -w @vesioh/api

# ── runtime ───────────────────────────────────────────────────────────────────
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Bundled server, runtime dependencies, and the generated Prisma client + schema.
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/prisma ./prisma
COPY --from=build /repo/apps/api/package.json ./package.json

# Run as the unprivileged user shipped with the base image.
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]

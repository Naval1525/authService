# syntax=docker/dockerfile:1

# ---------- Base: shared OS layer (Prisma needs OpenSSL) ----------
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# ---------- Deps: install ALL dependencies (needed to build) ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build: generate Prisma client + compile TypeScript ----------
FROM deps AS build
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Production: lean runtime image ----------
FROM base AS production
ENV NODE_ENV=production

# Only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Prisma CLI + generated client + query engine, copied from the build stage.
# (The CLI is a devDependency, so we copy it in rather than reinstall it —
#  the "migrate" compose service uses it to run `prisma migrate deploy`.)
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Compiled app + schema (schema is required by `prisma migrate deploy`)
COPY --from=build /app/dist ./dist
COPY prisma ./prisma

# Run as the image's built-in non-root user
USER node

EXPOSE 8080

# Default = API. Compose overrides this for the worker and migrate services.
CMD ["node", "dist/server.js"]

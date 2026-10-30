# syntax=docker/dockerfile:1.7
# Image production cho Railway / Render / VPS (phương án dự phòng của Vercel).
# Build:  DOCKER_BUILDKIT=1 docker build --secret id=database_url,env=DATABASE_URL -t tuyntantam-web .
# (Trang được prerender lúc build nên cần đọc DB; URL truyền qua BuildKit secret, không nằm trong image.)

FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG APP_URL=http://localhost:3000
ENV APP_URL=$APP_URL
# Chỉ dùng trong lúc build (không chép sang image chạy); giá trị thật đặt ở runtime
ENV SESSION_SECRET=build-time-placeholder-secret-not-used-at-runtime
RUN --mount=type=secret,id=database_url \
    DATABASE_URL="$(cat /run/secrets/database_url)" npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 UPLOAD_DIR=/app/storage/uploads
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Migration lúc chạy: node scripts/migrate.mjs
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.mjs ./scripts/migrate.mjs
RUN mkdir -p /app/storage/uploads && chown -R nextjs:nodejs /app/storage
USER nextjs
EXPOSE 3000
VOLUME ["/app/storage"]
CMD ["sh", "-c", "node scripts/migrate.mjs && node server.js"]

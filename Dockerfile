# ============================================================
#  Dockerfile — YouTube Clipper (Next.js)
#  Multi-stage build: node:20-alpine
#
#  Variabel NEXT_PUBLIC_* di-inline oleh Next.js SAAT BUILD,
#  jadi nilainya harus diberikan sebagai build arg:
#    docker build \
#      --build-arg NEXT_PUBLIC_APP_URL=https://domain.com \
#      --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
#      --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
#      -t ytc-web .
#  Cara termudah: pakai docker-compose.yml + file .env (lihat dokumen).
# ============================================================

# ---------- STAGE 1: BUILD ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependency (cache layer terpisah supaya build lebih cepat)
COPY package.json package-lock.json ./
RUN npm ci

# Salin seluruh kode (file besar dikecualikan via .dockerignore)
COPY . .

# Build args untuk nilai yang di-inline saat build
ARG NEXT_PUBLIC_APP_URL=https://example.com
ARG NEXT_PUBLIC_SUPABASE_URL=
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build produksi
RUN npm run build

# ---------- STAGE 2: RUNTIME ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Ambil hasil build & dependency dari stage builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

# Satu image dipakai dua service (web & bot telegram) lewat compose.
CMD ["npm", "run", "start"]

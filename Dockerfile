FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock* ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile

COPY . .
RUN bunx prisma generate && bun run build

RUN mkdir -p .next/standalone/.next \
    && cp -r .next/static .next/standalone/.next/static \
    && cp -r public .next/standalone/public

ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME=0.0.0.0

EXPOSE 80

# Jalankan Next.js pada port internal 80, terlepas dari isi skrip "start".
CMD ["bun", ".next/standalone/server.js"]

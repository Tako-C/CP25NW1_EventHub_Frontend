# =============================
# 1️⃣ Build Stage
# =============================
FROM node:18-alpine AS builder

WORKDIR /app

# รับค่า NEXT_PUBLIC_API_URL จาก docker-compose build args
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# คัดลอกไฟล์ dependency ก่อน เพื่อใช้ layer cache
COPY package*.json ./

# ติดตั้ง dependency
RUN npm ci

# คัดลอกโค้ดทั้งหมด
COPY . .

# สร้าง build production
RUN npm run build

# =============================
# 2️⃣ Production Stage
# =============================
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# คัดลอกเฉพาะสิ่งที่จำเป็น
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# คำสั่งรัน production server
CMD ["npm", "start"]
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

# WORKDIR /app

# # ✅ แก้ไขตรงนี้: บังคับให้เป็น /api ไปเลย ไม่ต้องรอรับ ARG
# ENV NEXT_PUBLIC_API_URL=/capstone25/cp25nw1/api

# # คัดลอกไฟล์ dependency
# COPY package*.json ./

# ติดตั้ง dependency
RUN npm ci

# คัดลอกโค้ดทั้งหมด
COPY . .

# สร้าง build production
RUN npm run build

# # =============================
# # 2️⃣ Production Stage
# # =============================
# FROM node:18-alpine AS runner

# WORKDIR /app
# ENV NODE_ENV=production

# ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# # คัดลอกเฉพาะสิ่งที่จำเป็น
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json

# EXPOSE 3000

# # คำสั่งรัน production server
# CMD ["npm", "start"]

# ... (ส่วน Builder Stage เหมือนเดิม) ...

# =============================
# 2️⃣ Production Stage
# =============================
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# 1. Copy โฟลเดอร์ public (รูปภาพต่างๆ)
COPY --from=builder /app/public ./public

# 2. Copy โครงสร้าง standalone (ไฟล์ server.js และ node_modules ที่จำเป็น)
COPY --from=builder /app/.next/standalone ./

# 3. สำคัญมาก: ต้อง Copy โฟลเดอร์ static ไปไว้ข้างใน .next อีกที 
# เพื่อให้ server.js ของ standalone มองเห็นไฟล์ CSS/JS
COPY --from=builder /app/.next/static ./.next/static 

EXPOSE 3000

# รันด้วย node โดยตรง (ไม่ต้องผ่าน npm start)
CMD ["node", "server.js"]
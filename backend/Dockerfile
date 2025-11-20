# Sử dụng node alpine cho nhẹ
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# 1. Copy package.json trước để tận dụng Docker Cache
# Nếu file này không đổi, Docker sẽ bỏ qua bước npm install -> Build siêu nhanh
COPY package*.json ./

# 2. Copy thư mục prisma để chạy generate
COPY prisma ./prisma/

# 3. Cài đặt dependencies (Cần cài cả devDependencies để build được TypeScript)
RUN npm install

# 4. Tạo Prisma Client (BẮT BUỘC)
RUN npx prisma generate

# 5. Giờ mới copy toàn bộ code nguồn vào
COPY . .

# 6. Build TypeScript sang JavaScript (Ra thư mục dist)
RUN npm run build

# 7. Mở port
EXPOSE 3000

# 8. Chạy lệnh start (Lưu ý check package.json xem lệnh start chạy file nào)
# Thường là: "start": "node dist/app.js" hoặc "node dist/main.js"
CMD ["npm", "run", "start"]
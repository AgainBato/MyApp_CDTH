# 1. Giai đoạn Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install
RUN npm install react-dom@19.1.0 react-native-web @expo/metro-runtime
# Copy toàn bộ source code
COPY . .

# Chạy lệnh build web (Kết quả thường nằm trong thư mục 'dist')
RUN npm run build:web

# 2. Giai đoạn Run (Nginx)
FROM nginx:alpine

# Copy file build từ giai đoạn trước vào Nginx
# Lưu ý: Expo bản mới xuất ra thư mục 'dist'. Nếu code cũ là 'web-build' thì sửa lại dòng dưới.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx (sẽ tạo ở bước 3)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
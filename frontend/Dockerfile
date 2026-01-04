# 1. Giai đoạn Build (Dùng Node.js để build code React ra file tĩnh)
FROM node:22-alpine as build
WORKDIR /app

# Copy file package để cài thư viện trước (tận dụng cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ code và chạy lệnh build
COPY . .
RUN npm run build

# 2. Giai đoạn Run (Dùng Nginx để chạy web siêu nhẹ)
FROM nginx:alpine
# Copy file đã build từ giai đoạn 1 vào thư mục của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy file cấu hình Nginx bạn vừa tạo vào trong container
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
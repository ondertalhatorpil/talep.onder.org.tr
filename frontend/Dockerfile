# Build aşaması
FROM node:18-alpine as build

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm install

# Kaynak kodunu kopyala
COPY . .

# Uygulamayı derle
RUN npm run build

# Çalıştırma aşaması
FROM nginx:alpine

# Build aşamasından derlenmiş dosyaları kopyala
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx varsayılan konfigürasyonu
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Portu dışarı aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
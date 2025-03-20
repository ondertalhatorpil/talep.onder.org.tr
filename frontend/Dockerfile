# Build aşaması
FROM node:18-alpine as build

WORKDIR /app

# Bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# Diğer dosyaları kopyala
COPY . .

# Ortam değişkenlerini ayarla
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build
RUN npm run build

# Production aşaması
FROM nginx:alpine

# Nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build dosyalarını Nginx'e kopyala
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
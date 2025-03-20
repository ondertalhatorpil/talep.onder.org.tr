FROM node:18-alpine

WORKDIR /app

# Önce package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Modülleri yükle
RUN npm install

# Sonra diğer tüm dosyaları kopyala
COPY . .

# Uygulamanın çalışacağı portu belirle
EXPOSE 8060

# Uygulamayı başlat
CMD ["npm", "start"]
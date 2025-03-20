FROM node:18-alpine

WORKDIR /app

# Önce package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Modülleri yükle ve bcrypt'i yeniden derle
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Sonra diğer tüm dosyaları kopyala
COPY . .

# Uygulamanın çalışacağı portu belirle
EXPOSE 8060

# Uygulamayı başlat
CMD ["npm", "start"]
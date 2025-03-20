FROM node:18

WORKDIR /app

# Build araçlarını ve Python'u kur
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && ln -s /usr/bin/python3 /usr/bin/python

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
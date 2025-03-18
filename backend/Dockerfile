FROM node:18-alpine

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm install --production

# Kaynak kodunu kopyala
COPY . .

# Health check için curl ekle
RUN apk add --no-cache curl

# Portu dışarı aç
EXPOSE 8460

# Sağlık kontrolü endpoint'i için server.js'e ekleme yapın (gerekiyorsa):
# app.get('/health', (req, res) => res.status(200).send('OK'));

# Uygulamayı başlat
CMD ["node", "src/server.js"]
# Estágio 1: Builder - Instala dependências e gera o bundle
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod

# Estágio 2: Production - Copia apenas o necessário para rodar
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# Instala SOMENTE as dependências de produção
RUN npm install --omit=dev

# Copia o bundle gerado no estágio anterior
COPY --from=builder /usr/src/app/dist/bundle.js ./dist/bundle.js

# O comando agora executa o arquivo único
CMD [ "node", "dist/bundle.js" ]
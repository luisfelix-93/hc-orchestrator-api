# =================================================================
# STAGE 1: Build a aplicação
# =================================================================
FROM node:18 AS build

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de definição de pacotes
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies)
RUN npm install

# Copia o restante do código-fonte da aplicação
COPY . .

# Compila o código TypeScript para JavaScript
RUN npm run build

# =================================================================
# STAGE 2: Cria a imagem final de produção
# =================================================================
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia as dependências de produção do estágio de build
COPY --from=build /usr/src/app/node_modules ./node_modules
# Copia o código compilado do estágio de build
COPY --from=build /usr/src/app/dist ./dist

# Expõe a porta que a aplicação irá rodar
EXPOSE 5001

# Comando para iniciar a aplicação
CMD [ "node", "dist/index.js" ]


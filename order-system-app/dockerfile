FROM node:20.12.0

# Cria um diretório para armazenar os arquivos da aplicação
WORKDIR /order_system

# Copia os arquivos do package.json e package-lock.json
COPY package.json /order_system
COPY package-lock.json /order_system

# Instala as dependências do projeto
RUN npm install

# Copia todos os arquivos do projeto para o diretório de trabalho
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando para executar a aplicação
CMD ["npm", "start"]
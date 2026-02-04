FROM node:22.15.1-alpine3.21
WORKDIR /usr/app
ARG GITHUB_TOKEN
ENV NODE_AUTH_TOKEN=${GITHUB_TOKEN}
COPY package*.json ./
RUN npm install
#Copiem restul codului
COPY . .
#Build NestJS
RUN npm run build
#Expunem portul aplicației
EXPOSE 3000
#Pornim aplicația
CMD ["node", "dist/main.js"]
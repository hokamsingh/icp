# base image
FROM node:20 AS base

WORKDIR /nestjs-app

ARG PORT

RUN npm install pm2 --location=global

COPY package.json .
COPY package-lock.json .
COPY prisma/schema.prisma prisma/schema.prisma

ENV HUSKY=0

RUN npm install

COPY . .

EXPOSE ${PORT}

# development image
FROM base AS nestjs-app-dev

CMD ["npm", "run", "start:dev"]

# production image
FROM base AS nestjs-app

RUN npm run build

CMD ["pm2-runtime", "start", "ecosystem.config.js"]

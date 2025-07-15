FROM node:slim

RUN apt-get update && apt-get install -y curl

WORKDIR /app

COPY package.json package-lock.json  ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]

# FROM node:slim as dev

# RUN apt-get update && apt-get install -y curl

# WORKDIR /app

# COPY package.json package-lock.json  ./

# RUN npm install

# COPY . .

# CMD ["npm", "run", "dev"]
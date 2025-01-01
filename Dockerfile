FROM node:20-bookworm

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

COPY . .

RUN npm run build

CMD ["node", "dist"]

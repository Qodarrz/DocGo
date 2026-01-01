FROM node:20-bullseye

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN npx prisma generate

ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]

FROM node:22-alpine3.20 as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


#build  producting  image
FROM node:22-alpine3.20 

WORKDIR /app

# choosing the working directory

COPY package*.json ./

ENV NODE_ENV=production
# making the project environment to production

RUN npm ci

COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app && chmod -R 755 /app

RUN  npm install pm2 -g


COPY ecosystem.config.js .

USER node

EXPOSE 5513

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
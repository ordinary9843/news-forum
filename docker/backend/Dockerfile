FROM node:20

WORKDIR /usr/src/app

COPY ./backend/ ./

RUN npm install
RUN npm install pm2 -g
RUN npm run build

CMD ["pm2-runtime", "dist/main.js"]
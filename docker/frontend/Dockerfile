FROM node:14

WORKDIR /app

COPY ./frontend/ ./

RUN npm install
RUN npm run build

CMD ["npm", "run", "start"]
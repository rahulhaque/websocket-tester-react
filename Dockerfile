FROM node:17-alpine3.12

EXPOSE 3000

RUN mkdir -p /socktest

WORKDIR /socktest

RUN npm install -g serve

CMD [ "serve", "-s", "-C" ]

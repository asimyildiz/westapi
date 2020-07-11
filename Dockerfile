FROM node:latest

RUN mkdir -p /usr/src/westapi
WORKDIR /usr/src/westapi
COPY package.json /usr/src/westapi/
RUN npm install

COPY . /usr/src/westapi
ENV NODE_ENV PRODUCTION

EXPOSE 8080
CMD [ "npm", "run", "start" ]
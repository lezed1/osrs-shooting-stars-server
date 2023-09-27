FROM node:16-alpine as build

WORKDIR /home/node/app/

ADD package.json package-lock.json ./
RUN npm install

ADD tsconfig.json webpack.config.js .eslintrc.js .prettierrc .gitignore ./
ADD src ./src
# RUN ls >&2 && exit 2
RUN npm run build

FROM node:16-alpine

WORKDIR /home/node/app/

ADD package.json package-lock.json ./

RUN npm install --omit=dev

COPY --from=build /home/node/app/dist/bundle.js ./bundle.js

CMD ["node", "--enable-source-maps", "./bundle.js"]
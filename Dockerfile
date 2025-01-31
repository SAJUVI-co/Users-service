FROM node:22.13

WORKDIR /home/api

COPY . /home/api/

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
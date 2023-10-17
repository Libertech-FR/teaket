FROM node:18.18.2-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /usr/src/app

# Install dependencies
# @see https://github.com/gliderlabs/docker-alpine/blob/master/docs/usage.md#disabling-cache
# @see https://pkgs.alpinelinux.org/packages
RUN apk update && apk --no-cache upgrade && apk add --no-cache \
  git \
  jq \
  nano \
  vim \
  bash \
  bash-completion \
  iputils \
  inetutils-telnet \
  bind-tools \
  net-tools \
  tcpdump

COPY . .

RUN yarn workspace @libertech-fr/teaket_app install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false \
  && yarn cache clean \
  && yarn autoclean --init \
  && yarn autoclean --force

EXPOSE 3000

CMD ["yarn", "workspace", "@libertech-fr/teaket_app", "start:prod"]

FROM node:18.14.0-alpine AS builder

WORKDIR /usr/src/app

COPY . .
COPY ../package.json /tmp/root-package.json
COPY ./package.json /tmp/service-package.json

# Install jq
RUN apk update && apk --no-cache upgrade && apk add --no-cache jq

# Merge package.json files
RUN jq -s '.[0] * .[1]' /tmp/root-package.json /tmp/service-package.json > /tmp/merged-package.json

COPY /tmp/merged-package.json /usr/src/app/package.json

RUN apk add git && yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

RUN yarn run build

FROM node:18.14.0-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# ADD Makefile .
# ADD package.json .
ADD *.lock .

COPY --from=builder /usr/src/app/package.json ./package.json

RUN apk add --no-cache \
  openssl \
  git \
  jq \
  nano

# Merge package.json files


RUN yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

#COPY . .

COPY --from=builder /usr/src/app/dist ./dist
COPY views ./views

EXPOSE 2100

CMD ["yarn", "start:prod"]

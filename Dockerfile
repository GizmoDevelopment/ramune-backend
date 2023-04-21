# Environment setup
FROM node:20-alpine
LABEL org.opencontainers.image.source https://github.com/GizmoDevelopment/ramune-chat
WORKDIR /opt/production

RUN npm i -g npm@latest pnpm

# Dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch

ADD . ./
RUN pnpm install --offline

# Build
RUN pnpm build
RUN pnpm prune --prod

# Deploy
ENV RAMUNE_CDN=${RAMUNE_CDN}
ENV GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS}
ENV DATABASE_URL=${DATABASE_URL}

CMD [ "pnpm", "start" ]

FROM node:16 as preparation
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /usr/production
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
COPY tsconfig.json ./
COPY . ./
RUN pnpm run build

FROM node:16 as start
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /usr/production

# Set up directory
COPY --from=preparation /usr/production/package.json ./
COPY --from=preparation /usr/production/pnpm-lock.yaml ./
COPY --from=preparation /usr/production/build ./build
COPY config.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

ENV RAMUNE_CDN=${RAMUNE_CDN}
ENV GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS}
ENV DATABASE_URL=${DATABASE_URL}

CMD [ "pnpm", "start" ]
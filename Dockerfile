FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY scripts/build.mjs ./scripts/build.mjs
COPY dist/assets ./dist/assets
RUN node scripts/build.mjs
FROM nginx:stable-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist/config.js /opt/lifebots-config.js
COPY --chmod=755 deploy/40-lifebots-config.sh /docker-entrypoint.d/40-lifebots-config.sh
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

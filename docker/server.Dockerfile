# Multi-stage build. Runtime runs the TypeScript entry via tsx (same loader as dev
# and `npm start`), so the server and its workspace packages share one code path.

FROM node:22-alpine AS base
WORKDIR /workspace
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY packages/validation/package.json packages/validation/
COPY server/package.json server/

FROM base AS deps
# Install ONCE with workspace linking to a single node_modules tree.
RUN npm ci --no-audit --no-fund

FROM deps AS build
# Copy workspace sources and build the server (typechecks as a side effect).
COPY packages packages
COPY server server
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=build /workspace/package.json ./
COPY --from=build /workspace/package-lock.json ./
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/packages ./packages
COPY --from=build /workspace/server ./server
COPY --from=build /workspace/tsconfig.base.json ./
# Dist is validated by `build`; runtime uses the same tsx path as dev.
EXPOSE 4000
USER node
CMD ["node", "--import", "tsx", "server/src/index.ts"]
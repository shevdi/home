FROM node:22-alpine AS development-dependencies-env
ARG VITE_BACKEND_URL=http://localhost:3000/api/v1
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:22-alpine AS production-dependencies-env
ARG VITE_BACKEND_URL=http://localhost:3000/api/v1
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:22-alpine AS build-env
ARG VITE_BACKEND_URL=http://localhost:3000/api/v1
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:22-alpine
ARG VITE_BACKEND_URL=http://localhost:3000/api/v1
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]
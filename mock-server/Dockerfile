FROM node:22

WORKDIR /app

# Root package files for workspace resolution
COPY package.json package-lock.json ./
COPY shared ./shared
COPY mock-server ./mock-server

RUN npm install

# Flatten: mock-server runs from /app
RUN cp -r mock-server/. .

CMD ["npm", "run", "start"]

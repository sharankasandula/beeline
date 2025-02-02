# Stage 1: Build client
FROM node:18 as client-builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm install
COPY client/ .
RUN npm run build

# Stage 2: Build server
FROM node:18
WORKDIR /app
COPY server/package.json server/package-lock.json* ./server/
WORKDIR /app/server
RUN npm install
COPY server/ ./
COPY --from=client-builder /app/client/build ../client/build
RUN mkdir -p Downloads
EXPOSE 5000
CMD ["npm", "start"]

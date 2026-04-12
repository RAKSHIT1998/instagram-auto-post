FROM node:20-alpine

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend .

CMD ["node", "src/worker.js"]

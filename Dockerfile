FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/ ./backend/
COPY frontend/ ./frontend/

EXPOSE 3000 8000

CMD ["node", "backend/server.js"]

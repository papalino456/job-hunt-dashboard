# Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend runtime
FROM node:20-alpine

WORKDIR /app/backend

# Copy backend
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/public /app/frontend/public
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json

# Create data directory
RUN mkdir -p /data

ENV NODE_ENV=production
ENV DATABASE_PATH=/data/jobs.db
ENV PORT=3000

EXPOSE 3000

# Serve frontend static files from backend
CMD ["node", "src/index.js"]

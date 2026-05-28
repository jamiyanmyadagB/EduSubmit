# ═══════════════════════════════════════════
# EduSubmit Frontend Dockerfile (Multi-Stage)
# React 18 + TypeScript + Tailwind CSS
# Port: 3000
# ═══════════════════════════════════════════

# ─── Stage 1: Builder ───
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Nginx Serve ───
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built app
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Create non-root user
RUN adduser -D -u 1000 appuser && chown -R appuser:appuser /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

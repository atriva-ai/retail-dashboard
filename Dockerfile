# 1. Base image
FROM node:18-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Only copy dependency files first
COPY package.json package-lock.json ./

# 4. Install dependencies
RUN npm install --legacy-peer-deps

# 5. Copy source code
COPY . .

# Build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Debug environment variables
RUN echo "API URL is $NEXT_PUBLIC_API_URL"

# 6. Build the app
RUN npm run build

# 7. Final stage for production server
FROM node:18-alpine AS runner

WORKDIR /app

# Set env to production
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy built output from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

CMD ["npm", "start"]

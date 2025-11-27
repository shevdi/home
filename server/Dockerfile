# Use official Node.js LTS image as base
FROM node:22-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy all files
COPY . .

# ----------------------------
# Production stage
# ----------------------------
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the app port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start"]

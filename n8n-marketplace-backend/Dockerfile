# Base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npx @nestjs/cli build

# Remove dev dependencies after build
RUN npm prune --production

# Set environment to production
ENV NODE_ENV=production

# Railway injects PORT at runtime — expose it
EXPOSE 3001

# Start the application
CMD ["node", "dist/src/main"]

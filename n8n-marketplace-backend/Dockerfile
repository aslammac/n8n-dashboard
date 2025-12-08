# Base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Install Nest CLI globally to ensure build command works
RUN npm install -g @nestjs/cli

# Build the application
RUN npm run build
RUN ls -la /app
RUN ls -la /app/dist || echo "dist directory not found"

# Set environment to production
ENV NODE_ENV=production

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "dist/src/main"]
